-- Projects table for multi-tenancy
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Competitors table
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    name TEXT NOT NULL,
    main_category TEXT,
    categories TEXT[],
    rating NUMERIC(2, 1),
    reviews INT,
    website TEXT,
    address TEXT,
    is_spending_on_ads BOOLEAN DEFAULT FALSE,
    operational_status TEXT,
    market_query TEXT,
    last_updated TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, place_id)
);

-- Competitor metrics (derived scores from n8n)
CREATE TABLE competitor_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID UNIQUE REFERENCES competitors(id) ON DELETE CASCADE,
    reputation_score NUMERIC,
    digital_readiness_score NUMERIC,
    competition_level TEXT,
    risk_flag BOOLEAN
);

-- SWOT analysis
CREATE TABLE swot_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID UNIQUE REFERENCES competitors(id) ON DELETE CASCADE,
    strength TEXT[],
    weakness TEXT[],
    opportunity TEXT[],
    threat TEXT[]
);

-- User insights
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    competitor_id UUID REFERENCES competitors(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_competitors_project_id ON competitors(project_id);
CREATE INDEX idx_competitors_rating ON competitors(rating);
CREATE INDEX idx_competitor_metrics_competitor_id ON competitor_metrics(competitor_id);
CREATE INDEX idx_swot_analysis_competitor_id ON swot_analysis(competitor_id);
CREATE INDEX idx_insights_project_id ON insights(project_id);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE swot_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for competitors
CREATE POLICY "Users can access project competitors" ON competitors
    FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- RLS Policies for competitor_metrics
CREATE POLICY "Users can access project metrics" ON competitor_metrics
    FOR ALL USING (competitor_id IN (
        SELECT id FROM competitors WHERE project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    ));

-- RLS Policies for swot_analysis
CREATE POLICY "Users can access project swot" ON swot_analysis
    FOR ALL USING (competitor_id IN (
        SELECT id FROM competitors WHERE project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    ));

-- RLS Policies for insights
CREATE POLICY "Users can manage project insights" ON insights
    FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
