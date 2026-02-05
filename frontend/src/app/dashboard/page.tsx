"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { 
  BarChart3, 
  GitPullRequest, 
  CheckCircle2, 
  XCircle,
  Clock,
  Plus,
  ExternalLink
} from "lucide-react";
import { api, setAuthToken } from "@/src/lib/api";
import { formatRelativeTime, getStatusBadge } from "@/src/lib/utils";
import type { UserStats, Analysis } from "@/src/types";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
        
        // Load stats and recent analyses
        const [statsRes, analysesRes] = await Promise.all([
          api.getStats(),
          api.getAnalyses(10, 0),
        ]);

        setStats(statsRes.data);
        setAnalyses(analysesRes.data.analyses);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your PR analyses
          </p>
        </div>
        <Link href="/dashboard/analyze">
          <Button className="gap-2 text-sm">
            <Plus className="w-4 h-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Total Analyses</span>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats?.stats.totalAnalyses || 0}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.stats.completedAnalyses || 0}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Failed</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.stats.failedAnalyses || 0}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Unique Repos</span>
            <GitPullRequest className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.stats.uniqueRepos || 0}</p>
        </Card>
      </div>

      {/* Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Analyses</h2>
          <Link href="/dashboard/analyze">
            <Button variant="outline" size="sm" className="text-xs">
              View All
            </Button>
          </Link>
        </div>

        {analyses.length === 0 ? (
          <Card className="p-12 text-center">
            <GitPullRequest className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base font-semibold mb-2">No analyses yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start analyzing your first pull request
            </p>
            <Link href="/dashboard/analyze">
              <Button className="text-sm">
                Create Analysis
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <Card key={analysis._id} className="p-6 hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitPullRequest className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">
                        {analysis.repoOwner}/{analysis.repoName}
                      </h3>
                      <span className="text-xs text-muted-foreground">#{analysis.prNumber}</span>
                      <Badge variant={getStatusBadge(analysis.status)} className="text-xs">
                        {analysis.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(analysis.createdAt)}
                      </span>
                      {analysis.filesAnalyzed > 0 && (
                        <span>{analysis.filesAnalyzed} files analyzed</span>
                      )}
                      {analysis.issuesFound > 0 && (
                        <span className="text-yellow-500">
                          {analysis.issuesFound} issues found
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/analysis/${analysis._id}`}>
                      <Button variant="outline" size="sm" className="gap-2 text-xs">
                        View Details
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}