"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card } from "@/src/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { 
  User as UserIcon, 
  Mail, 
  Calendar,
  BarChart3,
  GitPullRequest
} from "lucide-react";
import { api, setAuthToken } from "@/src/lib/api";
import { formatRelativeTime } from "@/src/lib/utils";
import type { UserStats } from "@/src/types";

export default function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
        const response = await api.getStats();
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and view statistics
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              {user?.firstName} {user?.lastName}
            </h2>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Member since {formatRelativeTime(stats?.user.memberSince || new Date().toISOString())}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>User ID: {stats?.user.clerkId}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Badge variant="secondary">Free Plan</Badge>
              <Badge variant="outline">Developer</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Total Analyses</h3>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-4xl font-bold mb-2">
              {stats?.stats.totalAnalyses || 0}
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>✅ {stats?.stats.completedAnalyses || 0} completed</span>
              <span>❌ {stats?.stats.failedAnalyses || 0} failed</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Unique Repositories</h3>
              <GitPullRequest className="w-5 h-5 text-primary" />
            </div>
            <p className="text-4xl font-bold mb-2">
              {stats?.stats.uniqueRepos || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Repositories analyzed
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Success Rate</h3>
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-4xl font-bold mb-2">
              {stats?.stats.totalAnalyses && stats.stats.totalAnalyses > 0
                ? Math.round((stats.stats.completedAnalyses / stats.stats.totalAnalyses) * 100)
                : 0}%
            </p>
            <p className="text-sm text-muted-foreground">
              Successful analyses
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Processing</h3>
              <GitPullRequest className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-4xl font-bold mb-2">
              {stats?.stats.processingAnalyses || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Currently analyzing
            </p>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <GitPullRequest className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {activity.repoOwner}/{activity.repoName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PR #{activity.prNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      activity.status === 'completed' ? 'default' :
                      activity.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}