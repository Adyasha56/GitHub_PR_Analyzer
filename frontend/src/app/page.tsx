import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { ThemeToggle } from "@/src/components/theme-toggle";
import {
  GitPullRequest,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Github,
  Code2,
  Brain,
  Rocket
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid Background - subtle, full page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e2e8_1px,transparent_1px),linear-gradient(to_bottom,#e2e2e8_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#2e2e33_1px,transparent_1px),linear-gradient(to_bottom,#2e2e33_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-80" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground tracking-tight">Previo</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="rounded-full px-4 text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="rounded-full px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section — with more visible grid overlay */}
      <section className="relative overflow-hidden">
        {/* Hero-specific grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8c8d4_1px,transparent_1px),linear-gradient(to_bottom,#c8c8d4_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#44444c_1px,transparent_1px),linear-gradient(to_bottom,#44444c_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />
        {/* Radial fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        {/* Dark mode radial glow */}
        <div className="absolute inset-x-0 bottom-0 h-[500px] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(167,139,250,0.15),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 lg:py-32 relative z-10">
          {/* Floating orbs */}
          <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/15 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/15 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

          <div className="max-w-5xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AI-Powered PR Reviewer
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-5 tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              Code Reviews
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient">
                done right
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Previo is a smart code review tool designed to make GitHub pull requests faster, safer, and more reliable.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12 sm:mb-16 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
              <Link href="/sign-up">
                <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
                  Try it Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <Card className="p-1 bg-card border-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-shadow duration-500">
                <div className="bg-muted rounded-lg p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                      <div className="w-3 h-3 rounded-full bg-chart-2 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-3 h-3 rounded-full bg-chart-1 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Dashboard Preview</span>
                  </div>

                  {/* Stats Preview */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                      { label: "Total Analyses", value: "342", icon: BarChart3 },
                      { label: "Completed", value: "318", icon: CheckCircle2 },
                      { label: "Issues Found", value: "1,234", icon: Shield },
                      { label: "Unique Repos", value: "45", icon: Github }
                    ].map((stat, i) => (
                      <Card key={i} className="p-3 sm:p-4 bg-card border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">{stat.label}</span>
                          <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                      </Card>
                    ))}
                  </div>

                  {/* Analysis Preview */}
                  <Card className="p-4 bg-card border-border text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <GitPullRequest className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">facebook/react #28749</h4>
                        <p className="text-sm text-muted-foreground">Analyzed 2 hours ago</p>
                      </div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        Completed
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">30 files analyzed</span>
                      <span className="text-chart-2">5 issues found</span>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Rocket className="w-3.5 h-3.5" />
            Simple Process
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">How it Works</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Get started in minutes with our simple 3-step process
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              step: "1",
              title: "Connect Repository",
              description: "Paste your GitHub repository URL and PR number",
              icon: Github
            },
            {
              step: "2",
              title: "AI Analysis",
              description: "Our AI analyzes code quality, security, and performance",
              icon: Brain
            },
            {
              step: "3",
              title: "Get Insights",
              description: "Receive detailed feedback and actionable recommendations",
              icon: Sparkles
            }
          ].map((item, i) => (
            <div key={i} className="relative flex flex-col">
              <Card className="p-5 bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col gap-4 relative overflow-hidden group">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center border border-primary/25 shrink-0">
                    {item.step}
                  </span>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Built with Modern Tools
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">Powerful Features</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need for comprehensive code reviews
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Code2,
              title: "Smart Code Analysis",
              description: "AI understands context and coding patterns to provide meaningful insights"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Get comprehensive analysis in seconds, not hours of manual review"
            },
            {
              icon: Shield,
              title: "Security Scanning",
              description: "Automatically detect vulnerabilities and security issues in your code"
            },
            {
              icon: BarChart3,
              title: "Detailed Metrics",
              description: "Track code quality metrics and improvements across all your PRs"
            },
            {
              icon: Brain,
              title: "Multiple AI Models",
              description: "Powered by GPT-4, Gemini, Claude, and Grok for best results"
            },
            {
              icon: CheckCircle2,
              title: "Best Practices",
              description: "Get recommendations based on industry standards and conventions"
            }
          ].map((feature, i) => (
            <Card key={i} className="p-4 bg-card border-border hover:border-primary/50 hover:shadow-md transition-all duration-300">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mb-3 border border-primary/10">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Tech Stack Icons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 opacity-50">
          <div className="text-xs text-muted-foreground">Powered by:</div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {['Next.js', 'TypeScript', 'OpenAI', 'Gemini', 'Claude'].map((tech) => (
              <div key={tech} className="px-3 py-1 bg-card border border-border rounded-lg text-xs font-medium text-foreground">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ready to Improve Your Code?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            Join developers who are shipping better code with AI-powered reviews
          </p>
          <Link href="/sign-up">
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              Start Free Today <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-foreground">Previo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Smart code review tool designed to make GitHub pull requests faster, safer, and more reliable.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 Previo. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
