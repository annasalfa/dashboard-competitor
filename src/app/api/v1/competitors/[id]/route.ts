import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function normalizeRating(rating: number | undefined | null): number | null {
    if (!rating) return null
    if (rating > 5) return Math.round((rating / 10000) * 100) / 100
    return rating
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // Query competitor with metrics and SWOT
    const { data: competitor, error } = await supabase
        .from('competitors')
        .select(`
            *,
            competitor_metrics (*),
            swot_analysis (*)
        `)
        .eq('id', id)
        .single()

    if (error || !competitor) {
        return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Transform response
    const response = {
        id: competitor.id,
        place_id: competitor.place_id,
        name: competitor.name,
        description: null,
        main_category: competitor.main_category,
        categories: competitor.categories || [],
        rating: normalizeRating(competitor.rating),
        reviews: competitor.reviews || 0,
        website: competitor.website,
        address: competitor.address,
        phone: null,
        owner_name: null,
        featured_image: null,
        operational_status: competitor.operational_status || 'active',
        workday_timing: null,
        closed_on: null,
        market_query: competitor.market_query,
        link: '',
        review_keywords: [],
        nearby_competitors: null,
        competitor_metrics: competitor.competitor_metrics,
        swot_analysis: competitor.swot_analysis
    }

    return NextResponse.json(response)
}
