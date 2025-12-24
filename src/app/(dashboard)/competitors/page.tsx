"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Star,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitorWithDetails } from "@/lib/supabase/types";

interface CompetitorsResponse {
    data: CompetitorWithDetails[];
    total: number;
    page: number;
    limit: number;
}

export default function CompetitorsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const limit = 10;

    const { data, isLoading, error } = useQuery<CompetitorsResponse>({
        queryKey: ["competitors", page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
            });
            const res = await fetch(`/api/v1/competitors?${params}`);
            if (!res.ok) throw new Error("Failed to fetch competitors");
            return res.json();
        },
    });

    const totalPages = Math.ceil((data?.total || 0) / limit);

    const getRatingColor = (rating: number | null) => {
        if (!rating) return "text-muted-foreground";
        if (rating >= 4.5) return "text-green-500";
        if (rating >= 4.0) return "text-lime-500";
        if (rating >= 3.0) return "text-yellow-500";
        return "text-red-500";
    };

    const getCompetitionBadge = (level: string | null | undefined) => {
        if (!level) return null;
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            Low: "secondary",
            Medium: "default",
            High: "destructive",
        };
        return <Badge variant={variants[level] || "default"}>{level}</Badge>;
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="p-6">
                    <p className="text-destructive">Error loading competitors</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Competitors</h1>
                    <p className="text-muted-foreground">
                        Browse and analyze your market competition
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search competitors..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Competitors Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isLoading ? (
                            <Skeleton className="h-6 w-32" />
                        ) : (
                            `${data?.total || 0} Competitors`
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Reviews</TableHead>
                                <TableHead>Competition</TableHead>
                                <TableHead>Risk</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <Skeleton className="h-5 w-32" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-12" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-16" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-16" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-5 w-8" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-8 w-8 ml-auto" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : data?.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <p className="text-muted-foreground">No competitors found</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Data will appear here once ingested via n8n
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data.map((competitor) => (
                                    <TableRow key={competitor.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {competitor.name}
                                                {competitor.website && (
                                                    <a
                                                        href={competitor.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-primary"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {competitor.main_category || "N/A"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className={`flex items-center gap-1 ${getRatingColor(
                                                    competitor.rating
                                                )}`}
                                            >
                                                <Star className="h-4 w-4 fill-current" />
                                                {competitor.rating?.toFixed(1) || "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell>{competitor.reviews || 0}</TableCell>
                                        <TableCell>
                                            {getCompetitionBadge(
                                                competitor.competitor_metrics?.competition_level
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {competitor.competitor_metrics?.risk_flag && (
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/competitors/${competitor.id}`}>
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
