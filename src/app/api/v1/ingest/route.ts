import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Service role client for bypassing RLS (used only for n8n webhook)
function createServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    // Use service role key if available, otherwise fall back to anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    return createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll: () => [],
            setAll: () => { },
        },
    })
}

// Validate webhook secret
function validateWebhookSecret(request: NextRequest): boolean {
    const secret = request.headers.get('x-webhook-secret')
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET

    if (!expectedSecret || expectedSecret === 'change-this-secret') {
        console.warn('N8N_WEBHOOK_SECRET is not properly configured')
        return false
    }

    return secret === expectedSecret
}

interface IngestPayload {
    project_id: string
    competitors: Array<{
        place_id: string
        name: string
        main_category?: string
        categories?: string[]
        rating?: number
        reviews?: number
        website?: string
        address?: string
        is_spending_on_ads?: boolean
        operational_status?: string
        market_query?: string
        // Derived metrics from n8n
        reputation_score?: number
        digital_readiness_score?: number
        competition_level?: string
        risk_flag?: boolean
        // SWOT from n8n
        swot?: {
            strength?: string[]
            weakness?: string[]
            opportunity?: string[]
            threat?: string[]
        }
    }>
}

export async function POST(request: NextRequest) {
    try {
        // Validate webhook secret
        if (!validateWebhookSecret(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload: IngestPayload = await request.json()

        // Validate payload
        if (!payload.project_id || !Array.isArray(payload.competitors)) {
            return NextResponse.json({
                error: 'Invalid payload. Required: project_id and competitors array'
            }, { status: 400 })
        }

        const supabase = createServiceClient()

        // Verify project exists
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', payload.project_id)
            .single()

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        const results = {
            inserted: 0,
            updated: 0,
            errors: [] as string[]
        }

        // Process each competitor
        for (const comp of payload.competitors) {
            try {
                // Upsert competitor
                const { data: competitor, error: compError } = await supabase
                    .from('competitors')
                    .upsert({
                        project_id: payload.project_id,
                        place_id: comp.place_id,
                        name: comp.name,
                        main_category: comp.main_category,
                        categories: comp.categories,
                        rating: comp.rating,
                        reviews: comp.reviews,
                        website: comp.website,
                        address: comp.address,
                        is_spending_on_ads: comp.is_spending_on_ads ?? false,
                        operational_status: comp.operational_status,
                        market_query: comp.market_query,
                        last_updated: new Date().toISOString()
                    }, {
                        onConflict: 'project_id,place_id'
                    })
                    .select('id')
                    .single()

                if (compError) {
                    results.errors.push(`Failed to upsert ${comp.name}: ${compError.message}`)
                    continue
                }

                const competitorId = competitor.id

                // Upsert metrics if provided
                if (comp.reputation_score !== undefined ||
                    comp.digital_readiness_score !== undefined ||
                    comp.competition_level !== undefined ||
                    comp.risk_flag !== undefined) {
                    await supabase
                        .from('competitor_metrics')
                        .upsert({
                            competitor_id: competitorId,
                            reputation_score: comp.reputation_score,
                            digital_readiness_score: comp.digital_readiness_score,
                            competition_level: comp.competition_level,
                            risk_flag: comp.risk_flag
                        }, {
                            onConflict: 'competitor_id'
                        })
                }

                // Upsert SWOT if provided
                if (comp.swot) {
                    await supabase
                        .from('swot_analysis')
                        .upsert({
                            competitor_id: competitorId,
                            strength: comp.swot.strength || [],
                            weakness: comp.swot.weakness || [],
                            opportunity: comp.swot.opportunity || [],
                            threat: comp.swot.threat || []
                        }, {
                            onConflict: 'competitor_id'
                        })
                }

                results.inserted++
            } catch (err) {
                results.errors.push(`Error processing ${comp.name}: ${String(err)}`)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${results.inserted} competitors`,
            results
        })
    } catch (error) {
        console.error('Ingest API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/v1/ingest',
        method: 'POST',
        required_header: 'x-webhook-secret'
    })
}
