import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ScrapedCompetitor {
    place_id: string
    name: string
    description?: string
    reviews: number
    rating: number
    competitors?: string
    phone?: string
    website?: string
    can_claim?: number
    owner_name?: string
    owner_profile_link?: string
    featured_image?: string
    main_category: string
    categories: string
    workday_timing?: string
    closed_on?: string
    address: string
    review_keywords?: string
    link: string
    query: string
}

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
    }
    swot_analysis: {
        strength: string[]
        weakness: string[]
        opportunity: string[]
        threat: string[]
    }
}

function loadScrapedData(): ScrapedCompetitor[] {
    try {
        const filePath = path.join(process.cwd(), 'docs', 'scraped_data.json')
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(fileContent)
    } catch {
        return []
    }
}

// Normalize rating (some values appear as 45751 meaning 4.5751 or similar)
function normalizeRating(rating: number | undefined): number | null {
    if (!rating) return null
    if (rating > 5) {
        return Math.round((rating / 10000) * 100) / 100
    }
    return rating
}

// Calculate derived metrics
function calculateMetrics(comp: ScrapedCompetitor) {
    const rating = normalizeRating(comp.rating) || 0
    const reviews = comp.reviews || 0
    const hasWebsite = !!comp.website

    // Reputation score: weighted combination of rating and review count
    const ratingScore = rating / 5
    const reviewScore = Math.min(reviews / 100, 1) // Cap at 100 reviews
    const reputationScore = (ratingScore * 0.6) + (reviewScore * 0.4)

    // Digital readiness: based on website and featured image
    const digitalReadinessScore = (hasWebsite ? 0.6 : 0) + (comp.featured_image ? 0.4 : 0)

    // Competition level based on reviews
    let competitionLevel = 'Low'
    if (reviews >= 50) competitionLevel = 'High'
    else if (reviews >= 10) competitionLevel = 'Medium'

    // Risk flag: low rating or no reviews
    const riskFlag = rating < 3 || reviews === 0

    return {
        reputation_score: Math.round(reputationScore * 100) / 100,
        digital_readiness_score: Math.round(digitalReadinessScore * 100) / 100,
        competition_level: competitionLevel,
        risk_flag: riskFlag
    }
}

// Generate SWOT based on data
function generateSwot(comp: ScrapedCompetitor) {
    const rating = normalizeRating(comp.rating) || 0
    const reviews = comp.reviews || 0
    const hasWebsite = !!comp.website

    const strengths: string[] = []
    const weaknesses: string[] = []
    const opportunities: string[] = []
    const threats: string[] = []

    // Strengths
    if (rating >= 4.5) strengths.push(`High rating (${rating.toFixed(1)})`)
    else if (rating >= 4) strengths.push(`Good rating (${rating.toFixed(1)})`)
    if (reviews >= 50) strengths.push(`Strong review count (${reviews})`)
    else if (reviews >= 20) strengths.push(`Moderate review count (${reviews})`)
    if (hasWebsite) strengths.push('Has website presence')
    if (comp.workday_timing === 'Buka 24 jam') strengths.push('24-hour availability')

    // Weaknesses
    if (!hasWebsite) weaknesses.push('No website - missing digital presence')
    if (rating > 0 && rating < 4) weaknesses.push(`Below average rating (${rating.toFixed(1)})`)
    if (reviews === 0) weaknesses.push('No reviews yet')
    else if (reviews < 5) weaknesses.push(`Very few reviews (${reviews})`)

    // Opportunities
    if (!hasWebsite) opportunities.push('Website development opportunity')
    if (reviews < 20) opportunities.push('Review generation campaign')
    opportunities.push('Expand market presence')

    // Threats
    if (comp.competitors) {
        const competitorCount = (comp.competitors.match(/Name:/g) || []).length
        if (competitorCount >= 3) threats.push(`${competitorCount}+ nearby competitors`)
    }
    if (rating < 4) threats.push('Losing customers to higher-rated competitors')
    threats.push('Market competition pressure')

    return {
        strength: strengths.slice(0, 4),
        weakness: weaknesses.slice(0, 4),
        opportunity: opportunities.slice(0, 4),
        threat: threats.slice(0, 4)
    }
}

function transformCompetitor(comp: ScrapedCompetitor, index: number): TransformedCompetitor {
    return {
        id: String(index + 1),
        place_id: comp.place_id,
        name: comp.name,
        description: comp.description || null,
        main_category: comp.main_category || null,
        categories: comp.categories ? comp.categories.split(', ') : [],
        rating: normalizeRating(comp.rating),
        reviews: comp.reviews || 0,
        website: comp.website || null,
        address: comp.address || null,
        phone: comp.phone || null,
        operational_status: comp.closed_on === 'Open All Days' ? 'open' : 'limited',
        market_query: comp.query || null,
        link: comp.link,
        featured_image: comp.featured_image || null,
        competitor_metrics: calculateMetrics(comp),
        swot_analysis: generateSwot(comp)
    }
}

export async function GET(request: NextRequest) {
    const rawData = loadScrapedData()
    const competitors = rawData.map((c, i) => transformCompetitor(c, i))

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    let filtered = competitors

    // Apply filters
    if (search) {
        const searchLower = search.toLowerCase()
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.address?.toLowerCase().includes(searchLower)
        )
    }

    if (category) {
        filtered = filtered.filter(c => c.main_category === category)
    }

    // Paginate
    const offset = (page - 1) * limit
    const paginated = filtered.slice(offset, offset + limit)

    return NextResponse.json({
        data: paginated,
        total: filtered.length,
        page,
        limit
    })
}
