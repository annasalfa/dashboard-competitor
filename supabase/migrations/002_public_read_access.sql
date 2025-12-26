-- Migration: Add public read access for dashboard (no auth required)
-- Run this in Supabase SQL Editor to allow public read access

-- Allow public read on projects
CREATE POLICY "Public can view projects" ON projects
    FOR SELECT USING (true);

-- Allow public read on competitors
CREATE POLICY "Public can view competitors" ON competitors
    FOR SELECT USING (true);

-- Allow public read on competitor_metrics
CREATE POLICY "Public can view competitor_metrics" ON competitor_metrics
    FOR SELECT USING (true);

-- Allow public read on swot_analysis
CREATE POLICY "Public can view swot_analysis" ON swot_analysis
    FOR SELECT USING (true);

-- Allow public read on insights
CREATE POLICY "Public can view insights" ON insights
    FOR SELECT USING (true);
