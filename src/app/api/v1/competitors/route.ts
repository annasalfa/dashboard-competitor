import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface TransformedCompetitor {
    id: string
    place_id: string
    name: string
    description: string | null
    main_category: string | null
    categories: string[]
    rating: number | null
    reviews: number
    website: string | null
    address: string | null
    phone: string | null
    operational_status: string
    market_query: string | null
    link: string
    featured_image: string | null
    competitor_metrics: {
        reputation_score: number
        digital_readiness_score: number
        competition_level: string
        risk_flag: boolean
    } | null
    swot_analysis: {
        strength: string[]
        weakness: string[]
        opportunity: string[]
        threat: string[]
    } | null
}

// Normalize rating (some values appear as 45751 meaning 4.5751 or similar)
function normalizeRating(rating: number | undefined | null): number | null {
    if (!rating) return null
    if (rating > 5) {
        return Math.round((rating / 10000) * 100) / 100
    }
    return rating
}

function transformCompetitor(comp: Record<string, unknown>): TransformedCompetitor {
    return {
        id: comp.id as string,
        place_id: comp.place_id as string,
        name: comp.name as string,
        description: null,
        main_category: comp.main_category as string | null,
        categories: (comp.categories as string[]) || [],
        rating: normalizeRating(comp.rating as number | null),
        reviews: (comp.reviews as number) || 0,
        website: comp.website as string | null,
        address: comp.address as string | null,
        phone: null,
        operational_status: comp.operational_status as string || 'active',
        market_query: comp.market_query as string | null,
        link: '',
        featured_image: null,
        competitor_metrics: comp.competitor_metrics as TransformedCompetitor['competitor_metrics'],
        swot_analysis: comp.swot_analysis as TransformedCompetitor['swot_analysis']
    }
}

export async function GET(request: NextRequest) {
    const supabase = createClient()

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    // Build query
    let query = supabase
        .from('competitors')
        .select(`
            *,
            competitor_metrics (*),
            swot_analysis (*)
        `, { count: 'exact' })

    // Apply search filter
    if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
    }

    // Apply category filter
    if (category) {
        query = query.eq('main_category', category)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: competitors, error, count } = await query

    if (error) {
        console.error('Error fetching competitors:', error)
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Transform data
    const transformed = (competitors || []).map(c => transformCompetitor(c))

    return NextResponse.json({
        data: transformed,
        total: count || 0,
        page,
        limit
    })
}
