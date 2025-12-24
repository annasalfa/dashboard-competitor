export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            projects: {
                Row: {
                    id: string
                    name: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    user_id?: string
                    created_at?: string
                }
            }
            competitors: {
                Row: {
                    id: string
                    project_id: string
                    place_id: string
                    name: string
                    main_category: string | null
                    categories: string[] | null
                    rating: number | null
                    reviews: number | null
                    website: string | null
                    address: string | null
                    is_spending_on_ads: boolean
                    operational_status: string | null
                    market_query: string | null
                    last_updated: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    place_id: string
                    name: string
                    main_category?: string | null
                    categories?: string[] | null
                    rating?: number | null
                    reviews?: number | null
                    website?: string | null
                    address?: string | null
                    is_spending_on_ads?: boolean
                    operational_status?: string | null
                    market_query?: string | null
                    last_updated?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    place_id?: string
                    name?: string
                    main_category?: string | null
                    categories?: string[] | null
                    rating?: number | null
                    reviews?: number | null
                    website?: string | null
                    address?: string | null
                    is_spending_on_ads?: boolean
                    operational_status?: string | null
                    market_query?: string | null
                    last_updated?: string
                }
            }
            competitor_metrics: {
                Row: {
                    id: string
                    competitor_id: string
                    reputation_score: number | null
                    digital_readiness_score: number | null
                    competition_level: string | null
                    risk_flag: boolean | null
                }
                Insert: {
                    id?: string
                    competitor_id: string
                    reputation_score?: number | null
                    digital_readiness_score?: number | null
                    competition_level?: string | null
                    risk_flag?: boolean | null
                }
                Update: {
                    id?: string
                    competitor_id?: string
                    reputation_score?: number | null
                    digital_readiness_score?: number | null
                    competition_level?: string | null
                    risk_flag?: boolean | null
                }
            }
            swot_analysis: {
                Row: {
                    id: string
                    competitor_id: string
                    strength: string[] | null
                    weakness: string[] | null
                    opportunity: string[] | null
                    threat: string[] | null
                }
                Insert: {
                    id?: string
                    competitor_id: string
                    strength?: string[] | null
                    weakness?: string[] | null
                    opportunity?: string[] | null
                    threat?: string[] | null
                }
                Update: {
                    id?: string
                    competitor_id?: string
                    strength?: string[] | null
                    weakness?: string[] | null
                    opportunity?: string[] | null
                    threat?: string[] | null
                }
            }
            insights: {
                Row: {
                    id: string
                    project_id: string
                    competitor_id: string | null
                    content: string
                    tags: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    competitor_id?: string | null
                    content: string
                    tags?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    competitor_id?: string | null
                    content?: string
                    tags?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Project = Database['public']['Tables']['projects']['Row']
export type Competitor = Database['public']['Tables']['competitors']['Row']
export type CompetitorMetrics = Database['public']['Tables']['competitor_metrics']['Row']
export type SwotAnalysis = Database['public']['Tables']['swot_analysis']['Row']
export type Insight = Database['public']['Tables']['insights']['Row']

// Joined type for competitor with metrics and SWOT
export interface CompetitorWithDetails extends Competitor {
    competitor_metrics: CompetitorMetrics | null
    swot_analysis: SwotAnalysis | null
}
