"use client";

import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitorWithDetails } from "@/lib/supabase/types";

interface CompetitorsResponse {
    data: CompetitorWithDetails[];
    total: number;
}

interface AggregatedSwot {
    strengths: Array<{ text: string; count: number }>;
    weaknesses: Array<{ text: string; count: number }>;
    opportunities: Array<{ text: string; count: number }>;
    threats: Array<{ text: string; count: number }>;
}

function SwotSection({
    title,
    items,
    icon: Icon,
    color,
    bgColor,
}: {
    title: string;
    items: Array<{ text: string; count: number }>;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}) {
    return (
        <Card className={`${bgColor} border-none`}>
            <CardHeader className="pb-2">
                <CardTitle className={`flex items-center gap-2 ${color}`}>
                    <Icon className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {items.length > 0 ? (
                    <ul className="space-y-2">
                        {items.slice(0, 5).map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className={`text-xs ${color} font-medium`}>
                                    ({item.count})
                                </span>
                                <span className="text-sm">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No data available</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function SwotPage() {
    const { data, isLoading } = useQuery<CompetitorsResponse>({
        queryKey: ["competitors", "swot"],
        queryFn: async () => {
            const res = await fetch("/api/v1/competitors?limit=100");
            if (!res.ok) throw new Error("Failed to fetch competitors");
            return res.json();
        },
    });

    // Aggregate SWOT data from all competitors
    const aggregatedSwot: AggregatedSwot = {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
    };

    if (data?.data) {
        const countMap = {
            strengths: new Map<string, number>(),
            weaknesses: new Map<string, number>(),
            opportunities: new Map<string, number>(),
            threats: new Map<string, number>(),
        };

        data.data.forEach((competitor) => {
            const swot = competitor.swot_analysis;
            if (!swot) return;

            swot.strength?.forEach((s) => {
                countMap.strengths.set(s, (countMap.strengths.get(s) || 0) + 1);
            });
            swot.weakness?.forEach((w) => {
                countMap.weaknesses.set(w, (countMap.weaknesses.get(w) || 0) + 1);
            });
            swot.opportunity?.forEach((o) => {
                countMap.opportunities.set(o, (countMap.opportunities.get(o) || 0) + 1);
            });
            swot.threat?.forEach((t) => {
                countMap.threats.set(t, (countMap.threats.get(t) || 0) + 1);
            });
        });

        // Convert to sorted arrays
        aggregatedSwot.strengths = Array.from(countMap.strengths.entries())
            .map(([text, count]) => ({ text, count }))
            .sort((a, b) => b.count - a.count);

        aggregatedSwot.weaknesses = Array.from(countMap.weaknesses.entries())
            .map(([text, count]) => ({ text, count }))
            .sort((a, b) => b.count - a.count);

        aggregatedSwot.opportunities = Array.from(countMap.opportunities.entries())
            .map(([text, count]) => ({ text, count }))
            .sort((a, b) => b.count - a.count);

        aggregatedSwot.threats = Array.from(countMap.threats.entries())
            .map(([text, count]) => ({ text, count }))
            .sort((a, b) => b.count - a.count);
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SWOT Analysis</h1>
                <p className="text-muted-foreground">
                    Market-level insights aggregated from all competitors
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Competitors Analyzed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl font-bold">{data?.data.length || 0}</span>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl font-bold text-green-500">
                                {aggregatedSwot.strengths.length}
                            </span>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Weaknesses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl font-bold text-red-500">
                                {aggregatedSwot.weaknesses.length}
                            </span>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Market Threats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl font-bold text-orange-500">
                                {aggregatedSwot.threats.length}
                            </span>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* SWOT Grid */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-64" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    <SwotSection
                        title="Strengths"
                        items={aggregatedSwot.strengths}
                        icon={TrendingUp}
                        color="text-green-600"
                        bgColor="bg-green-500/5"
                    />
                    <SwotSection
                        title="Weaknesses"
                        items={aggregatedSwot.weaknesses}
                        icon={TrendingDown}
                        color="text-red-600"
                        bgColor="bg-red-500/5"
                    />
                    <SwotSection
                        title="Opportunities"
                        items={aggregatedSwot.opportunities}
                        icon={Lightbulb}
                        color="text-blue-600"
                        bgColor="bg-blue-500/5"
                    />
                    <SwotSection
                        title="Threats"
                        items={aggregatedSwot.threats}
                        icon={AlertTriangle}
                        color="text-orange-600"
                        bgColor="bg-orange-500/5"
                    />
                </div>
            )}
        </div>
    );
}
