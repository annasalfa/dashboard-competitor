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
    owner_name?: string
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

function loadScrapedData(): ScrapedCompetitor[] {
    try {
        const filePath = path.join(process.cwd(), 'docs', 'scraped_data.json')
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(fileContent)
    } catch {
        return []
    }
}

function normalizeRating(rating: number | undefined): number | null {
    if (!rating) return null
    if (rating > 5) return Math.round((rating / 10000) * 100) / 100
    return rating
}

function calculateMetrics(comp: ScrapedCompetitor) {
    const rating = normalizeRating(comp.rating) || 0
    const reviews = comp.reviews || 0
    const hasWebsite = !!comp.website

    const ratingScore = rating / 5
    const reviewScore = Math.min(reviews / 100, 1)
    const reputationScore = (ratingScore * 0.6) + (reviewScore * 0.4)
    const digitalReadinessScore = (hasWebsite ? 0.6 : 0) + (comp.featured_image ? 0.4 : 0)

    let competitionLevel = 'Low'
    if (reviews >= 50) competitionLevel = 'High'
    else if (reviews >= 10) competitionLevel = 'Medium'

    const riskFlag = rating < 3 || reviews === 0

    return {
        reputation_score: Math.round(reputationScore * 100) / 100,
        digital_readiness_score: Math.round(digitalReadinessScore * 100) / 100,
        competition_level: competitionLevel,
        risk_flag: riskFlag
    }
}

function generateSwot(comp: ScrapedCompetitor) {
    const rating = normalizeRating(comp.rating) || 0
    const reviews = comp.reviews || 0
    const hasWebsite = !!comp.website

    const strengths: string[] = []
    const weaknesses: string[] = []
    const opportunities: string[] = []
    const threats: string[] = []

    if (rating >= 4.5) strengths.push(`Excellent rating (${rating.toFixed(1)})`)
    else if (rating >= 4) strengths.push(`Good rating (${rating.toFixed(1)})`)
    if (reviews >= 50) strengths.push(`Strong review volume (${reviews} reviews)`)
    else if (reviews >= 20) strengths.push(`Moderate review count (${reviews} reviews)`)
    if (hasWebsite) strengths.push('Professional website presence')
    if (comp.workday_timing === 'Buka 24 jam') strengths.push('24-hour operation')
    if (comp.featured_image) strengths.push('Visual presence on Google Maps')

    if (!hasWebsite) weaknesses.push('No website - critical gap in digital presence')
    if (rating > 0 && rating < 4) weaknesses.push(`Below average rating requires attention (${rating.toFixed(1)})`)
    if (reviews === 0) weaknesses.push('Zero reviews - credibility concern')
    else if (reviews < 10) weaknesses.push(`Low review count limits visibility (${reviews} reviews)`)
    if (!comp.phone) weaknesses.push('No phone contact listed')

    if (!hasWebsite) opportunities.push('Develop website for lead generation')
    if (reviews < 20) opportunities.push('Implement review generation strategy')
    opportunities.push('Strengthen Google Maps optimization')
    opportunities.push('Expand service offerings')

    if (comp.competitors) {
        const competitorCount = (comp.competitors.match(/Name:/g) || []).length
        if (competitorCount >= 4) threats.push(`Crowded market with ${competitorCount}+ direct competitors`)
        else if (competitorCount >= 2) threats.push(`${competitorCount} nearby competitors`)
    }
    if (rating > 0 && rating < 4) threats.push('Risk of customer loss to higher-rated competitors')
    threats.push('Industry competition intensifying')
    threats.push('Price pressure from competitors')

    return {
        strength: strengths.slice(0, 5),
        weakness: weaknesses.slice(0, 5),
        opportunity: opportunities.slice(0, 5),
        threat: threats.slice(0, 5)
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const rawData = loadScrapedData()

    const index = parseInt(id) - 1
    if (index < 0 || index >= rawData.length) {
        return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    const comp = rawData[index]

    const competitor = {
        id,
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
        owner_name: comp.owner_name || null,
        featured_image: comp.featured_image || null,
        operational_status: comp.closed_on === 'Open All Days' ? 'open' : 'limited',
        workday_timing: comp.workday_timing || null,
        closed_on: comp.closed_on || null,
        market_query: comp.query || null,
        link: comp.link,
        review_keywords: comp.review_keywords ? comp.review_keywords.split(', ') : [],
        nearby_competitors: comp.competitors || null,
        competitor_metrics: calculateMetrics(comp),
        swot_analysis: generateSwot(comp)
    }

    return NextResponse.json(competitor)
}
