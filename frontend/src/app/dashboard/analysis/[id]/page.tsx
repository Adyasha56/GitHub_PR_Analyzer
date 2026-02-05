"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  GitPullRequest,
  ArrowLeft,
  ExternalLink,
  Clock,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bug,
  Copy,
  Lightbulb,
} from "lucide-react";
import { api, setAuthToken } from "@/src/lib/api";
import { formatRelativeTime } from "@/src/lib/utils";
import type { Analysis } from "@/src/types";

export default function AnalysisDetailPage() {
  const { getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const analysisId = params.id as string;

  const copyResponseToClipboard = () => {
    // JSON Format (Current)
    const resultsText = JSON.stringify(analysis?.results, null, 2);
    navigator.clipboard.writeText(resultsText);
    
    // Plain Text Format (Commented - Uncomment to use)
    // const results = analysis?.results;
    // const files = results?.files || [];
    // const summary = results?.summary || {};
    // 
    // let plainText = `PR Analysis Report\n`;
    // plainText += `Repository: ${analysis?.repoOwner}/${analysis?.repoName}\n`;
    // plainText += `PR #${analysis?.prNumber}\n\n`;
    // plainText += `=== SUMMARY ===\n`;
    // plainText += `Total Files: ${summary?.total_files || 0}\n`;
    // plainText += `Total Issues: ${summary?.total_issues || 0}\n`;
    // plainText += `Bugs: ${summary?.bugs || 0}\n`;
    // plainText += `Performance Issues: ${summary?.performance_issues || 0}\n`;
    // plainText += `Style Issues: ${summary?.style_issues || 0}\n\n`;
    // 
    // plainText += `=== ISSUES BY FILE ===\n\n`;
    // files.forEach((file: any) => {
    //   plainText += ` ${file.name}\n`;
    //   plainText += `   Issues: ${file.issues?.length || 0}\n\n`;
    //   
    //   file.issues?.forEach((issue: any, idx: number) => {
    //     plainText += `   ${idx + 1}. [${issue.type?.toUpperCase()}] ${issue.severity?.toUpperCase()}\n`;
    //     if (issue.line) plainText += `      Line: ${issue.line}\n`;
    //     plainText += `      ${issue.description}\n`;
    //     if (issue.suggestion) plainText += `       ${issue.suggestion}\n`;
    //     plainText += `\n`;
    //   });
    // });
    // 
    // navigator.clipboard.writeText(plainText);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
        const response = await api.getAnalysis(analysisId);
        setAnalysis(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card className="p-12 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
          <p className="text-muted-foreground">{error || "This analysis does not exist"}</p>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Parse results - handle both old and new format
  const results = analysis.results;
  const files = results?.files || [];
  const summary = results?.summary || {};

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <GitPullRequest className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {analysis.repoOwner}/{analysis.repoName}
            </h1>
            <Badge variant="outline">#{analysis.prNumber}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              {getStatusIcon(analysis.status)}
              <Badge variant={getStatusBadgeVariant(analysis.status) as any}>
                {analysis.status}
              </Badge>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatRelativeTime(analysis.createdAt)}
            </span>
            {analysis.aiProvider && (
              <Badge variant="secondary">{analysis.aiProvider.toUpperCase()}</Badge>
            )}
          </div>
        </div>
        <a
          href={`${analysis.repoUrl}/pull/${analysis.prNumber}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </Button>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Files Analyzed</span>
            <FileCode className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{analysis.filesAnalyzed || files.length || 0}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Issues Found</span>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{analysis.issuesFound || analysis.results?.summary?.total_issues || 0}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Critical Issues</span>
            <Bug className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold">{analysis.results?.summary?.critical_issues || analysis.results?.summary?.bugs || 0}</p>
        </Card>
      </div>

      {/* Error Display */}
      {analysis.status === "failed" && analysis.error && (
        <Card className="p-6 border-red-500 bg-red-500/10">
          <h3 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Analysis Failed
          </h3>
          <p className="text-sm text-red-400">{analysis.error}</p>
        </Card>
      )}

      {/* Results */}
      {analysis.status === "completed" && results && (
        <>
          {/* Summary */}
          {summary && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Analysis Summary
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyResponseToClipboard}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Results
                    </>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Files:</span>
                  <span className="ml-2 font-medium">{analysis.results?.summary?.total_files || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Issues:</span>
                  <span className="ml-2 font-medium">{analysis.results?.summary?.total_issues || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bugs:</span>
                  <span className="ml-2 font-medium text-red-500">{analysis.results?.summary?.bugs || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Style Issues:</span>
                  <span className="ml-2 font-medium text-yellow-500">{analysis.results?.summary?.style_issues || 0}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Issues by File */}
          {files.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-500" />
                Issues by File
              </h3>
              <div className="space-y-4">
                {files.map((file: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileCode className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-medium">{file.name}</span>
                      <Badge variant="outline">{file.issues?.length || 0} issues</Badge>
                    </div>
                    {file.issues && file.issues.length > 0 && (
                      <div className="space-y-2">
                        {file.issues.map((issue: any, issueIndex: number) => (
                          <div
                            key={issueIndex}
                            className={`p-3 rounded-md text-sm ${
                              issue.type === "bug"
                                ? "bg-red-500/10 border-l-2 border-red-500"
                                : issue.type === "performance"
                                ? "bg-yellow-500/10 border-l-2 border-yellow-500"
                                : "bg-blue-500/10 border-l-2 border-blue-500"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  issue.severity === "high"
                                    ? "destructive"
                                    : issue.severity === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {issue.type}
                              </Badge>
                              {issue.line && (
                                <span className="text-xs text-muted-foreground">
                                  Line {issue.line}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground">{issue.description}</p>
                            {issue.suggestion && (
                              <p className="mt-2 text-green-400 flex items-start gap-1">
                                <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                                {issue.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Raw Response (fallback) */}
          {results.raw_response && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Raw AI Response</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyResponseToClipboard}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Response
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs">
                {results.raw_response}
              </pre>
            </Card>
          )}
        </>
      )}

      {/* Processing State */}
      {(analysis.status === "pending" || analysis.status === "processing") && (
        <Card className="p-12 text-center">
          <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Analysis in Progress</h3>
          <p className="text-muted-foreground mb-4">
            We are analyzing your pull request. This may take a few moments.
          </p>
          <Button onClick={loadAnalysis} variant="outline">
            Refresh Status
          </Button>
        </Card>
      )}
    </div>
  );
}
