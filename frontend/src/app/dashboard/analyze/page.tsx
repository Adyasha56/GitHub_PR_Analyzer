"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { 
  GitPullRequest, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { api, setAuthToken } from "@/src/lib/api";

export default function NewAnalysisPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    taskId: string;
    analysisId: string;
  } | null>(null);

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">New PR Analysis</h1>
        <p className="text-muted-foreground">
          Analyze a GitHub pull request with AI
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Repository URL
            </label>
            <Input
              type="text"
              placeholder="https://github.com/facebook/react"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
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
      <Card className="p-6 bg-primary/5">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-primary" />
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
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Example</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Repository:</span>
            <code className="bg-secondary px-2 py-1 rounded">
              https://github.com/facebook/react
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">PR Number:</span>
            <code className="bg-secondary px-2 py-1 rounded">
              28000
            </code>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2"
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