// Analysis Types
export interface Analysis {
  _id: string;
  taskId: string;
  userId: string;
  repoUrl: string;
  repoName: string;
  repoOwner: string;
  prNumber: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: AnalysisResults | null;
  error: string | null;
  aiProvider: string;
  filesAnalyzed: number;
  issuesFound: number;
  createdAt: string;
  completedAt: string | null;
}

export interface AnalysisResults {
  summary?: string;
  codeReview?: {
    score?: number;
    issues?: Array<{
      severity: string;
      message: string;
      file?: string;
      line?: number;
    }>;
  };
  securityReview?: {
    score?: number;
    vulnerabilities?: Array<{
      severity: string;
      message: string;
      file?: string;
    }>;
  };
  suggestions?: string[];
}

// User Stats Types
export interface UserStats {
  user: {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    imageUrl: string;
    memberSince: string;
  };
  stats: {
    totalAnalyses: number;
    completedAnalyses: number;
    failedAnalyses: number;
    processingAnalyses: number;
    uniqueRepos: number;
    analysisCount: number;
  };
  recentActivity: Array<{
    repoName: string;
    repoOwner: string;
    prNumber: number;
    status: string;
    createdAt: string;
  }>;
}

// API Response Types
export interface AnalysisListResponse {
  analyses: Analysis[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface StartAnalysisResponse {
  message: string;
  taskId: string;
  analysisId: string;
  status: string;
  statusUrl: string;
}