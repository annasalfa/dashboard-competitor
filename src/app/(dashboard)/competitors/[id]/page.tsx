"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Star,
    MapPin,
    Globe,
    Tag,
    AlertCircle,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitorWithDetails } from "@/lib/supabase/types";

function SwotCard({
    title,
    items,
    color,
}: {
    title: string;
    items: string[] | null;
    color: string;
}) {
    return (
        <Card className={`border-l-4 ${color}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {items && items.length > 0 ? (
                    <ul className="space-y-1">
                        {items.map((item, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                                • {item}
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

export default function CompetitorDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    const { data, isLoading, error } = useQuery<CompetitorWithDetails>({
        queryKey: ["competitor", id],
        queryFn: async () => {
            const res = await fetch(`/api/v1/competitors/${id}`);
            if (!res.ok) throw new Error("Failed to fetch competitor");
            return res.json();
        },
    });

    if (error) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" asChild>
                    <Link href="/competitors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Competitors
                    </Link>
                </Button>
                <Card className="p-6">
                    <p className="text-destructive">Error loading competitor</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild>
                <Link href="/competitors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Competitors
                </Link>
            </Button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    {isLoading ? (
                        <Skeleton className="h-9 w-64" />
                    ) : (
                        <h1 className="text-3xl font-bold tracking-tight">{data?.name}</h1>
                    )}
                    {isLoading ? (
                        <Skeleton className="h-5 w-48 mt-2" />
                    ) : (
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{data?.main_category || "N/A"}</Badge>
                            {data?.operational_status && (
                                <Badge
                                    variant={
                                        data.operational_status === "open"
                                            ? "default"
                                            : "destructive"
                                    }
                                >
                                    {data.operational_status}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
                {data?.website && (
                    <Button variant="outline" asChild>
                        <a href={data.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-2 h-4 w-4" />
                            Visit Website
                        </a>
                    </Button>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                <span className="text-2xl font-bold">
                                    {data?.rating?.toFixed(1) || "N/A"}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl font-bold">{data?.reviews || 0}</span>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Reputation Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <span className="text-2xl font-bold">
                                    {data?.competitor_metrics?.reputation_score?.toFixed(2) ||
                                        "N/A"}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Digital Readiness
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl font-bold">
                                {data?.competitor_metrics?.digital_readiness_score?.toFixed(2) ||
                                    "N/A"}
                            </span>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : (
                        <>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm">{data?.address || "No address"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="flex flex-wrap gap-1">
                                    {data?.categories?.map((cat, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {cat}
                                        </Badge>
                                    )) || "No categories"}
                                </div>
                            </div>
                            {data?.competitor_metrics?.risk_flag && (
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        This competitor is flagged at risk
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* SWOT Analysis */}
            <div>
                <h2 className="text-xl font-semibold mb-4">SWOT Analysis</h2>
                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        <SwotCard
                            title="Strengths"
                            items={data?.swot_analysis?.strength ?? null}
                            color="border-l-green-500"
                        />
                        <SwotCard
                            title="Weaknesses"
                            items={data?.swot_analysis?.weakness ?? null}
                            color="border-l-red-500"
                        />
                        <SwotCard
                            title="Opportunities"
                            items={data?.swot_analysis?.opportunity ?? null}
                            color="border-l-blue-500"
                        />
                        <SwotCard
                            title="Threats"
                            items={data?.swot_analysis?.threat ?? null}
                            color="border-l-orange-500"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
