"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, X, Star, Globe, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitorWithDetails } from "@/lib/supabase/types";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface CompetitorsResponse {
    data: CompetitorWithDetails[];
    total: number;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

export default function ComparePage() {
    const [selected, setSelected] = useState<string[]>([]);

    const { data, isLoading } = useQuery<CompetitorsResponse>({
        queryKey: ["competitors", "compare"],
        queryFn: async () => {
            const res = await fetch("/api/v1/competitors?limit=50");
            if (!res.ok) throw new Error("Failed to fetch competitors");
            return res.json();
        },
    });

    const selectedCompetitors =
        data?.data.filter((c) => selected.includes(c.id)) || [];

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id));
        } else if (selected.length < 4) {
            setSelected([...selected, id]);
        }
    };

    // Prepare radar chart data
    const radarData = [
        {
            metric: "Rating",
            ...Object.fromEntries(
                selectedCompetitors.map((c, i) => [
                    `comp${i}`,
                    ((c.rating || 0) / 5) * 100,
                ])
            ),
        },
        {
            metric: "Reviews",
            ...Object.fromEntries(
                selectedCompetitors.map((c, i) => [
                    `comp${i}`,
                    Math.min(((c.reviews || 0) / 500) * 100, 100),
                ])
            ),
        },
        {
            metric: "Reputation",
            ...Object.fromEntries(
                selectedCompetitors.map((c, i) => [
                    `comp${i}`,
                    (c.competitor_metrics?.reputation_score || 0) * 100,
                ])
            ),
        },
        {
            metric: "Digital",
            ...Object.fromEntries(
                selectedCompetitors.map((c, i) => [
                    `comp${i}`,
                    (c.competitor_metrics?.digital_readiness_score || 0) * 100,
                ])
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Compare</h1>
                <p className="text-muted-foreground">
                    Select up to 4 competitors to compare side by side
                </p>
            </div>

            {/* Selection Panel */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Competitors ({selected.length}/4)</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-9 w-32" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {data?.data.map((competitor) => {
                                const isSelected = selected.includes(competitor.id);
                                return (
                                    <Button
                                        key={competitor.id}
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleSelect(competitor.id)}
                                        disabled={!isSelected && selected.length >= 4}
                                    >
                                        {isSelected && <Check className="mr-1 h-3 w-3" />}
                                        {competitor.name}
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Comparison View */}
            {selectedCompetitors.length > 0 && (
                <>
                    {/* Radar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#374151" />
                                    <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                                    <PolarRadiusAxis
                                        angle={30}
                                        domain={[0, 100]}
                                        stroke="#9ca3af"
                                    />
                                    {selectedCompetitors.map((comp, index) => (
                                        <Radar
                                            key={comp.id}
                                            name={comp.name}
                                            dataKey={`comp${index}`}
                                            stroke={COLORS[index]}
                                            fill={COLORS[index]}
                                            fillOpacity={0.2}
                                        />
                                    ))}
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Side by Side Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {selectedCompetitors.map((competitor, index) => (
                            <Card
                                key={competitor.id}
                                className="border-t-4"
                                style={{ borderTopColor: COLORS[index] }}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{competitor.name}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => toggleSelect(competitor.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Badge variant="outline" className="w-fit">
                                        {competitor.main_category}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Rating
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-medium">
                                                {competitor.rating?.toFixed(1) || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Reviews
                                        </span>
                                        <span className="font-medium">{competitor.reviews || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Website
                                        </span>
                                        {competitor.website ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <X className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Reputation
                                        </span>
                                        <span className="font-medium">
                                            {competitor.competitor_metrics?.reputation_score?.toFixed(
                                                2
                                            ) || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Competition
                                        </span>
                                        <Badge
                                            variant={
                                                competitor.competitor_metrics?.competition_level ===
                                                    "High"
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                        >
                                            {competitor.competitor_metrics?.competition_level || "N/A"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Empty State */}
            {selectedCompetitors.length === 0 && !isLoading && (
                <Card className="flex flex-col items-center justify-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No competitors selected</p>
                    <p className="text-sm text-muted-foreground">
                        Select competitors above to start comparing
                    </p>
                </Card>
            )}
        </div>
    );
}
