"use client";

import { useState } from "react";
import { Lightbulb, Plus, Tag, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Insight {
    id: string;
    content: string;
    tags: string[];
    createdAt: Date;
}

// Mock data for demo - in production this would come from the API
const mockInsights: Insight[] = [
    {
        id: "1",
        content: "Most competitors in this market lack a strong online presence. This is a significant opportunity for digital-first positioning.",
        tags: ["opportunity", "digital"],
        createdAt: new Date("2024-01-15"),
    },
    {
        id: "2",
        content: "High-rated competitors (4.5+) tend to have active Google Ads campaigns. Consider increasing ad spend to compete.",
        tags: ["competition", "ads"],
        createdAt: new Date("2024-01-14"),
    },
    {
        id: "3",
        content: "The 'Printing Services' category is oversaturated with 15 competitors. Consider niche positioning.",
        tags: ["market", "strategy"],
        createdAt: new Date("2024-01-13"),
    },
];

export default function InsightsPage() {
    const [insights, setInsights] = useState<Insight[]>(mockInsights);
    const [showForm, setShowForm] = useState(false);
    const [newContent, setNewContent] = useState("");
    const [newTags, setNewTags] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContent.trim()) return;

        const newInsight: Insight = {
            id: Date.now().toString(),
            content: newContent,
            tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
            createdAt: new Date(),
        };

        setInsights([newInsight, ...insights]);
        setNewContent("");
        setNewTags("");
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Insights & Notes</h1>
                    <p className="text-muted-foreground">
                        Capture your analysis and observations
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Insight
                </Button>
            </div>

            {/* Add Insight Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Insight</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Textarea
                                    placeholder="Write your insight or observation..."
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Input
                                    placeholder="Tags (comma separated)"
                                    value={newTags}
                                    onChange={(e) => setNewTags(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Save Insight</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Insights List */}
            <div className="space-y-4">
                {insights.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-12">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No insights yet</p>
                        <p className="text-sm text-muted-foreground">
                            Start adding insights from your competitor analysis
                        </p>
                    </Card>
                ) : (
                    insights.map((insight) => (
                        <Card key={insight.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <Lightbulb className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm leading-relaxed">{insight.content}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-3 w-3 text-muted-foreground" />
                                                {insight.tags.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {insight.createdAt.toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
