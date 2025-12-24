import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ScrapedCompetitor {
    place_id: string
    name: string
    reviews: number
    rating: number
    main_category: string
    website?: string
    phone?: string
    address?: string
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
function normalizeRating(rating: number | undefined): number {
    if (!rating) return 0
    if (rating > 5) {
        // Convert values like 45720 to 4.57
        return Math.round((rating / 10000) * 100) / 100
    }
    return rating
}

export async function GET() {
    const competitors = loadScrapedData()

    // Calculate statistics
    const totalCompetitors = competitors.length
    const validRatings = competitors
        .map(c => normalizeRating(c.rating))
        .filter(r => r > 0)
    const averageRating = validRatings.length > 0
        ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
        : 0

    // Rating distribution
    const ratingDistribution = [
        { range: '0-2', count: validRatings.filter(r => r > 0 && r < 2).length },
        { range: '2-3', count: validRatings.filter(r => r >= 2 && r < 3).length },
        { range: '3-4', count: validRatings.filter(r => r >= 3 && r < 4).length },
        { range: '4-5', count: validRatings.filter(r => r >= 4 && r <= 5).length },
    ]

    // Risk indicators
    const noRating = competitors.filter(c => !c.rating || c.rating === 0).length
    const lowRating = competitors.filter(c => normalizeRating(c.rating) > 0 && normalizeRating(c.rating) < 3).length
    const noWebsite = competitors.filter(c => !c.website).length

    // Top categories
    const categoryCount: Record<string, number> = {}
    competitors.forEach(c => {
        if (c.main_category) {
            categoryCount[c.main_category] = (categoryCount[c.main_category] || 0) + 1
        }
    })
    const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }))

    // Competition level based on reviews
    const competitionLevel = {
        low: competitors.filter(c => c.reviews < 10).length,
        medium: competitors.filter(c => c.reviews >= 10 && c.reviews < 50).length,
        high: competitors.filter(c => c.reviews >= 50).length,
    }

    return NextResponse.json({
        totalCompetitors,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
        riskIndicators: { atRisk: lowRating, noRating, noWebsite },
        topCategories,
        competitionLevel
    })
}
