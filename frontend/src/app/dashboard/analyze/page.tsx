"use client";

import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  GitPullRequest,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Github,
  Info
} from "lucide-react";
import Link from "next/link";
import { api, setAuthToken } from "@/src/lib/api";

export default function NewAnalysisPage() {
  const { getToken } = useAuth();
  const { openUserProfile } = useClerk();
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    taskId: string;
    analysisId: string;
  } | null>(null);
  const [showGithubInfo, setShowGithubInfo] = useState(false);

  useEffect(() => {
    setShowGithubInfo(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    // Validation
    if (!repoUrl || !prNumber) {
      setError("Please fill in all fields");
      return;
    }

    if (!repoUrl.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    const prNum = parseInt(prNumber);
    if (isNaN(prNum) || prNum < 1) {
      setError("Please enter a valid PR number");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
        const response = await api.analyzepr(repoUrl, prNum);
        
        setSuccess({
          taskId: response.data.taskId,
          analysisId: response.data.analysisId,
        });

        // Clear form
        setRepoUrl("");
        setPrNumber("");

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* GitHub Connect Info Dialog */}
      <Dialog open={showGithubInfo} onOpenChange={setShowGithubInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Analyzing private repos?
            </DialogTitle>
            <DialogDescription>
              Public repositories work right away with no setup. To analyze
              pull requests on your private repos, connect your GitHub
              account first.
            </DialogDescription>
          </DialogHeader>

          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">1</Badge>
              <span>Open your <strong className="text-foreground">Profile</strong> page</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">2</Badge>
              <span>Click <strong className="text-foreground">Manage account</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">3</Badge>
              <span>Under <strong className="text-foreground">Connected accounts</strong>, connect GitHub and approve access</span>
            </li>
          </ol>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGithubInfo(false)}>
              Maybe later
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                setShowGithubInfo(false);
                openUserProfile();
              }}
            >
              <Github className="w-4 h-4" />
              Connect GitHub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">New PR Analysis</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Analyze a GitHub pull request with AI
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Repository URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium inline-flex items-center gap-1.5">
              Repository URL
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex text-muted-foreground cursor-help">
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="inline-flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" />
                    Public repos work out of the box. To analyze private
                    repos, connect your GitHub account from{" "}
                    <Link href="/dashboard/profile" className="underline">
                      Profile
                    </Link>
                    .
                  </span>
                </TooltipContent>
              </Tooltip>
            </label>
            <Input
              type="text"
              placeholder="https://github.com/facebook/react"
              value={repoUrl}
              onChange={(e) => {
                const url = e.target.value;
                setRepoUrl(url);
                
                // Auto-extract PR number from URL
                const prMatch = url.match(/github\.com\/[^\/]+\/[^\/]+\/pull\/(\d+)/);
                if (prMatch && prMatch[1]) {
                  setPrNumber(prMatch[1]);
                }
              }}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the full GitHub repository URL
            </p>
          </div>

          {/* PR Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Pull Request Number
            </label>
            <Input
              type="number"
              placeholder="12345"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
              disabled={loading}
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Enter the PR number (e.g., #12345)
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Analysis started successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full gap-2" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting Analysis...
              </>
            ) : (
              <>
                <GitPullRequest className="w-4 h-4" />
                Analyze Pull Request
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="p-4 sm:p-6 bg-primary/5">
        <h3 className="text-sm sm:text-base font-semibold mb-2 flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <span>We fetch all files from your pull request</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <span>AI analyzes code quality, security, and performance</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <span>You get detailed insights and recommendations</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <span>Results are saved in your dashboard</span>
          </li>
        </ul>
      </Card>

      {/* Example */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold mb-3">Example</h3>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-muted-foreground">Repository:</span>
            <code className="bg-secondary px-2 py-1 rounded text-xs break-all">
              https://github.com/facebook/react
            </code>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-muted-foreground">PR Number:</span>
            <code className="bg-secondary px-2 py-1 rounded text-xs">
              28000
            </code>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2 w-full sm:w-auto text-xs sm:text-sm"
          onClick={() => {
            setRepoUrl("https://github.com/facebook/react");
            setPrNumber("28000");
          }}
        >
          <ExternalLink className="w-4 h-4" />
          Try Example
        </Button>
      </Card>
    </div>
  );
}