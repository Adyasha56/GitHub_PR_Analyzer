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
      {/* Grid Background - Always visible */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div> */}
            <span className="text-lg sm:text-xl font-bold text-foreground">Previo</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" className="text-foreground text-sm sm:text-base">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm sm:text-base">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Radial Glow at Bottom - Dark mode only */}
        <div className="absolute inset-x-0 bottom-0 h-[500px] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(167,139,250,0.2),transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-28 relative">
          {/* Floating orbs */}
          <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
          <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI-Powered PR Reviewer
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            Code Reviews
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient">
              done right
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Previo is a smart code review tool designed to make GitHub pull requests faster, safer, and more reliable.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-12 sm:mb-16 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300">
                Try it Now! <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <Card className="p-1 bg-card border-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-shadow duration-500">
              <div className="bg-muted rounded-lg p-8">
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
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Rocket className="w-4 h-4" />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">How it Works</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
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
            <div key={i} className="relative">
              <Card className="p-6 bg-card border-border hover:border-primary transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  {item.step}
                </div>
                <item.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Built with Modern Tools
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for comprehensive code reviews
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            <Card key={i} className="p-6 bg-card border-border hover:border-primary hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Tech Stack Icons */}
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 opacity-50">
          <div className="text-sm text-muted-foreground">Powered by:</div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {['Next.js', 'TypeScript', 'OpenAI', 'Gemini', 'Claude'].map((tech) => (
              <div key={tech} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-card border border-border rounded-lg text-xs sm:text-sm font-medium text-foreground">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 p-8 sm:p-12 md:p-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Ready to Improve Your Code?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join developers who are shipping better code with AI-powered reviews
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg">
              Start Free Today <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Previo</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Smart code review tool designed to make GitHub pull requests faster, safer, and more reliable.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Previo. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
