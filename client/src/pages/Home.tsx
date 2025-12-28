import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Cloud, ChefHat, FileText, TrendingUp, Sparkles } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Chef's Kiss" className="h-24" style={{ maxWidth: '400px' }} />
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              Intelligent Operations for <span className="text-primary">Data-Driven</span> Restaurants
            </h1>
            <div className="flex items-center justify-center mt-4">
              <img src="/hero-icon.png" alt="Chef's Kiss" className="h-64 w-64" />
            </div>
            <p className="text-xl text-muted-foreground">
              Transform your POS data into actionable insights. Optimize prep planning, reduce waste, 
              and increase profitability with AI-powered forecasting and weather intelligence.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg">Get Started Free</Button>
                </a>
              )}
              <Button size="lg" variant="outline">Watch Demo</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Optimize Operations</h2>
            <p className="text-muted-foreground text-lg">Powerful features designed for independent restaurants</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>
                  Track performance with interactive charts showing daily, weekly, and monthly trends
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI-Powered Forecasting</CardTitle>
                <CardDescription>
                  Predict sales based on historical patterns, weather conditions, and seasonal trends
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Cloud className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Weather Integration</CardTitle>
                <CardDescription>
                  Understand how weather impacts your sales and adjust operations accordingly
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <ChefHat className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Prep Planning</CardTitle>
                <CardDescription>
                  Convert forecasts into specific ingredient quantities to reduce waste
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle>LLM Analytics</CardTitle>
                <CardDescription>
                  Ask questions in natural language and get instant insights from your data
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Professional Reports</CardTitle>
                <CardDescription>
                  Generate stakeholder-ready PDF reports with AI-generated insights
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Operations?</h2>
          <p className="text-lg mb-8 opacity-90">Join restaurants saving $500-1,000/month through data-driven decisions</p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">Go to Dashboard</Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary">Start Free Trial</Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Chef's Kiss. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
