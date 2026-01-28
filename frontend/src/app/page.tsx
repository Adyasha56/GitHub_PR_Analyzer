import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { 
  Code2, 
  Zap, 
  Shield, 
  BarChart3, 
  Github, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Github className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">PR Analyzer</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            AI-Powered GitHub
            <span className="text-primary"> PR Analysis</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Get instant, intelligent code reviews for your pull requests.
            Catch bugs, improve quality, and ship faster with AI insights.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Analyzing <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Code Preview */}
          <div className="mt-12 bg-card border border-border rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-muted-foreground">example.tsx</span>
            </div>
            <pre className="text-sm">
              <code className="text-primary">import</code>
              <code> &#123; analyzepr &#125; </code>
              <code className="text-primary">from</code>
              <code> </code>
              <code className="text-yellow-500">&apos;@pr-analyzer&apos;</code>
              {'\n\n'}
              <code className="text-purple-500">const</code>
              <code> result = </code>
              <code className="text-primary">await</code>
              <code> analyzepr(</code>
              {'\n  '}
              <code className="text-yellow-500">&apos;facebook/react&apos;</code>
              <code>, </code>
              <code className="text-blue-500">12345</code>
              {'\n'}
              <code>)</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Why PR Analyzer?</h2>
          <p className="text-muted-foreground text-lg">
            Powerful features to elevate your code review process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
            <p className="text-muted-foreground">
              AI-powered code review that understands context and best practices
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Get comprehensive analysis in seconds, not hours
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Security First</h3>
            <p className="text-muted-foreground">
              Detect vulnerabilities and security issues automatically
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Detailed Insights</h3>
            <p className="text-muted-foreground">
              Track metrics and improvements across all your PRs
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            Get started in minutes
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Repository</h3>
              <p className="text-muted-foreground">
                Simply paste your GitHub repository URL
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Select PR Number</h3>
              <p className="text-muted-foreground">
                Choose which pull request you want to analyze
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Get AI Insights</h3>
              <p className="text-muted-foreground">
                Receive comprehensive analysis with actionable recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              What kind of analysis do you provide?
            </h3>
            <p className="text-muted-foreground ml-7">
              We provide comprehensive code quality analysis, security vulnerability detection, 
              performance recommendations, and best practice suggestions.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Is my code secure?
            </h3>
            <p className="text-muted-foreground ml-7">
              Yes! We only read your PR data through GitHub&apos;s API. We never store your code, 
              and all analysis happens in real-time.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              How many PRs can I analyze?
            </h3>
            <p className="text-muted-foreground ml-7">
              Free tier includes 100 PR analyses per month. Perfect for individual developers 
              and small teams.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Which AI models do you use?
            </h3>
            <p className="text-muted-foreground ml-7">
              We support multiple AI providers including OpenAI GPT-4, Google Gemini, 
              Anthropic Claude, and Grok for the best analysis quality.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Improve Your Code?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join developers who are shipping better code with AI-powered reviews
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Github className="w-6 h-6 text-primary" />
              <span className="font-semibold">PR Analyzer</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 PR Analyzer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}