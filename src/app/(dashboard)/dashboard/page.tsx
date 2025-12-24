"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Users,
    Star,
    AlertTriangle,
    Globe,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface DashboardData {
    totalCompetitors: number;
    averageRating: number;
    ratingDistribution: Array<{ range: string; count: number }>;
    riskIndicators: { atRisk: number; closed: number; noWebsite: number };
    topCategories: Array<{ category: string; count: number }>;
    competitionLevel: { low: number; medium: number; high: number };
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    loading,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    trend?: "up" | "down";
    loading?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{value}</div>
                        {trend && (
                            <span
                                className={
                                    trend === "up" ? "text-green-500" : "text-red-500"
                                }
                            >
                                {trend === "up" ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                            </span>
                        )}
                    </div>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const { data, isLoading, error } = useQuery<DashboardData>({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await fetch("/api/v1/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard data");
            return res.json();
        },
    });

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="p-6">
                    <p className="text-destructive">Error loading dashboard data</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </Card>
            </div>
        );
    }

    const competitionData = data
        ? [
            { name: "Low", value: data.competitionLevel.low, color: "#10b981" },
            { name: "Medium", value: data.competitionLevel.medium, color: "#f59e0b" },
            { name: "High", value: data.competitionLevel.high, color: "#ef4444" },
        ]
        : [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Market snapshot and competitor overview
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Competitors"
                    value={data?.totalCompetitors ?? 0}
                    icon={Users}
                    description="In your tracked markets"
                    loading={isLoading}
                />
                <StatsCard
                    title="Average Rating"
                    value={data?.averageRating?.toFixed(1) ?? "0.0"}
                    icon={Star}
                    description="Across all competitors"
                    loading={isLoading}
                />
                <StatsCard
                    title="At Risk"
                    value={data?.riskIndicators.atRisk ?? 0}
                    icon={AlertTriangle}
                    description="Low rating or closed status"
                    loading={isLoading}
                />
                <StatsCard
                    title="No Website"
                    value={data?.riskIndicators.noWebsite ?? 0}
                    icon={Globe}
                    description="Missing digital presence"
                    loading={isLoading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Rating Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[300px]" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data?.ratingDistribution || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="range" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Competition Level */}
                <Card>
                    <CardHeader>
                        <CardTitle>Competition Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[300px]" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={competitionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {competitionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[200px]" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={data?.topCategories || []}
                                layout="vertical"
                                margin={{ left: 100 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis
                                    type="category"
                                    dataKey="category"
                                    stroke="#9ca3af"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f2937",
                                        border: "1px solid #374151",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
