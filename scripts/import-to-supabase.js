// Script to import CSV data directly to Supabase
// Run with: node scripts/import-to-supabase.js
require('dotenv').config({ path: '.env.local' })

const XLSX = require('xlsx')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables!')
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Load CSV data
console.log('Loading CSV data...')
const csvPath = path.join(__dirname, '../docs/plastic-injection-molding-service-in-jakarta-jakarta-raya-indonesia.csv')
const workbook = XLSX.readFile(csvPath)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rawData = XLSX.utils.sheet_to_json(sheet)
console.log(`Loaded ${rawData.length} records from CSV`)

// Normalize rating (some values like 45751 mean 4.5751)
function normalizeRating(rating) {
    if (!rating) return null
    const num = parseFloat(rating)
    if (isNaN(num)) return null
    if (num > 5) {
        return Math.round((num / 10000) * 100) / 100
    }
    return num
}

// Parse JSON array from string
function parseJsonArray(str) {
    if (!str) return []
    if (Array.isArray(str)) return str
    try {
        // Handle escaped JSON strings
        const cleaned = str.replace(/\"\"/g, '"')
        const parsed = JSON.parse(cleaned)
        return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
        // If not JSON, split by comma
        return str.split(',').map(s => s.trim()).filter(Boolean)
    }
}

// Calculate metrics
function calculateMetrics(record) {
    const rating = normalizeRating(record.rating) || 0
    const reviews = parseInt(record.reviews) || 0
    const hasWebsite = !!record.website

    // Reputation score
    const ratingScore = rating / 5
    const reviewScore = Math.min(reviews / 100, 1)
    const reputationScore = (ratingScore * 0.6) + (reviewScore * 0.4)

    // Digital readiness
    const digitalReadinessScore = (hasWebsite ? 0.6 : 0) + (record.featured_image ? 0.4 : 0)

    // Competition level
    let competitionLevel = 'Low'
    if (reviews >= 50) competitionLevel = 'High'
    else if (reviews >= 10) competitionLevel = 'Medium'

    // Risk flag
    const riskFlag = rating < 3 || reviews === 0

    return {
        reputation_score: Math.round(reputationScore * 100) / 100,
        digital_readiness_score: Math.round(digitalReadinessScore * 100) / 100,
        competition_level: competitionLevel,
        risk_flag: riskFlag
    }
}

// Generate SWOT
function generateSwot(record) {
    const rating = normalizeRating(record.rating) || 0
    const reviews = parseInt(record.reviews) || 0
    const hasWebsite = !!record.website

    const strength = []
    const weakness = []
    const opportunity = []
    const threat = []

    // Strengths
    if (rating >= 4.5) strength.push(`High rating (${rating.toFixed(1)})`)
    else if (rating >= 4) strength.push(`Good rating (${rating.toFixed(1)})`)
    if (reviews >= 50) strength.push(`Strong review count (${reviews})`)
    else if (reviews >= 20) strength.push(`Moderate review count (${reviews})`)
    if (hasWebsite) strength.push('Has website presence')
    if (record.workday_timing === 'Buka 24 jam') strength.push('24-hour availability')

    // Weaknesses
    if (!hasWebsite) weakness.push('No website - missing digital presence')
    if (rating > 0 && rating < 4) weakness.push(`Below average rating (${rating.toFixed(1)})`)
    if (reviews === 0) weakness.push('No reviews yet')
    else if (reviews < 5) weakness.push(`Very few reviews (${reviews})`)

    // Opportunities
    if (!hasWebsite) opportunity.push('Website development opportunity')
    if (reviews < 20) opportunity.push('Review generation campaign')
    opportunity.push('Expand market presence')

    // Threats
    if (record.competitors) {
        try {
            const comps = JSON.parse(record.competitors.replace(/\"\"/g, '"'))
            if (Array.isArray(comps) && comps.length >= 3) {
                threat.push(`${comps.length}+ nearby competitors`)
            }
        } catch {
            const count = (record.competitors.match(/name/gi) || []).length
            if (count >= 3) threat.push(`${count}+ nearby competitors`)
        }
    }
    if (rating < 4) threat.push('Losing customers to higher-rated competitors')
    threat.push('Market competition pressure')

    return {
        strength: strength.slice(0, 4),
        weakness: weakness.slice(0, 4),
        opportunity: opportunity.slice(0, 4),
        threat: threat.slice(0, 4)
    }
}

// Transform record for database
function transformRecord(record) {
    const categories = parseJsonArray(record.categories)

    return {
        place_id: record.place_id,
        name: record.name,
        main_category: record.main_category || null,
        categories: categories.length > 0 ? categories : (record.main_category ? [record.main_category] : []),
        rating: normalizeRating(record.rating),
        reviews: parseInt(record.reviews) || 0,
        website: record.website || null,
        address: record.address || null,
        is_spending_on_ads: record.is_spending_on_ads === 'true' || record.is_spending_on_ads === true,
        operational_status: record.status || 'active',
        market_query: record.query || 'plastic injection molding service'
    }
}

async function main() {
    try {
        // Step 1: Create or get project
        console.log('\n=== Step 1: Setting up project ===')
        let projectId

        const { data: existingProjects, error: projectError } = await supabase
            .from('projects')
            .select('id')
            .eq('name', 'Competitor Analysis - Jakarta')
            .limit(1)

        if (projectError) {
            console.error('Error checking projects:', projectError.message)
            // Try to insert without user_id for public access
        }

        if (existingProjects && existingProjects.length > 0) {
            projectId = existingProjects[0].id
            console.log(`Using existing project: ${projectId}`)
        } else {
            const { data: newProject, error: insertError } = await supabase
                .from('projects')
                .insert({ name: 'Competitor Analysis - Jakarta' })
                .select('id')
                .single()

            if (insertError) {
                console.error('Error creating project:', insertError.message)
                console.log('Note: If RLS is enabled, you may need to disable it temporarily or use service role key')
                process.exit(1)
            }

            projectId = newProject.id
            console.log(`Created new project: ${projectId}`)
        }

        // Step 2: Clear existing competitors for this project (optional)
        console.log('\n=== Step 2: Clearing existing data ===')
        const { error: deleteError } = await supabase
            .from('competitors')
            .delete()
            .eq('project_id', projectId)

        if (deleteError) {
            console.log('Warning: Could not clear existing data:', deleteError.message)
        } else {
            console.log('Cleared existing competitors')
        }

        // Step 3: Insert competitors
        console.log('\n=== Step 3: Inserting competitors ===')
        const competitors = rawData.map(transformRecord)

        let successCount = 0
        let errorCount = 0

        // Insert in batches of 50
        const batchSize = 50
        for (let i = 0; i < competitors.length; i += batchSize) {
            const batch = competitors.slice(i, i + batchSize)
            const toInsert = batch.map(c => ({
                ...c,
                project_id: projectId
            }))

            const { data: insertedCompetitors, error: insertError } = await supabase
                .from('competitors')
                .insert(toInsert)
                .select('id, place_id')

            if (insertError) {
                console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, insertError.message)
                errorCount += batch.length
                continue
            }

            successCount += insertedCompetitors.length

            // Insert metrics and SWOT for each competitor
            for (let j = 0; j < insertedCompetitors.length; j++) {
                const comp = insertedCompetitors[j]
                const originalRecord = rawData.find(r => r.place_id === comp.place_id)

                if (originalRecord) {
                    // Insert metrics
                    const metrics = calculateMetrics(originalRecord)
                    await supabase.from('competitor_metrics').insert({
                        competitor_id: comp.id,
                        ...metrics
                    })

                    // Insert SWOT
                    const swot = generateSwot(originalRecord)
                    await supabase.from('swot_analysis').insert({
                        competitor_id: comp.id,
                        ...swot
                    })
                }
            }

            console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(competitors.length / batchSize)} (${successCount} competitors)`)
        }

        console.log('\n=== Import Complete ===')
        console.log(`Successfully imported: ${successCount} competitors`)
        console.log(`Errors: ${errorCount}`)
        console.log(`Project ID: ${projectId}`)

    } catch (error) {
        console.error('Import failed:', error)
        process.exit(1)
    }
}

main()
