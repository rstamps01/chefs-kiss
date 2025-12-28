import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Download, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PrepPlanning() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prep Planning</h1>
          <p className="text-muted-foreground mt-2">
            Daily ingredient prep recommendations based on sales forecasts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <ChefHat className="mr-2 h-4 w-4" />
            Generate Plan
          </Button>
        </div>
      </div>

      {/* AI Recommendation */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            AI Prep Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            <strong>Today's forecast: $2,850 (85% confidence).</strong> Rain is expected this afternoon, 
            which typically reduces dinner sales by 25-30%. Recommend reducing evening prep by 20% to 
            minimize waste. Focus on shelf-stable items and reduce fresh fish prep.
          </p>
        </CardContent>
      </Card>

      {/* Today's Prep List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Prep List</CardTitle>
          <CardDescription>December 26, 2025 - Quantities based on forecast</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Sushi Rice", quantity: "15 lbs", status: "pending", adjustment: "Standard" },
              { name: "Tuna (Sashimi Grade)", quantity: "8 lbs", status: "pending", adjustment: "-20% (Rain)" },
              { name: "Salmon (Sashimi Grade)", quantity: "10 lbs", status: "completed", adjustment: "Standard" },
              { name: "Cucumber", quantity: "12 units", status: "completed", adjustment: "Standard" },
              { name: "Avocado", quantity: "20 units", status: "pending", adjustment: "+10% (Weekend)" },
              { name: "Nori Sheets", quantity: "5 packs", status: "completed", adjustment: "Standard" },
              { name: "Ginger (Pickled)", quantity: "3 lbs", status: "pending", adjustment: "Standard" },
              { name: "Wasabi Paste", quantity: "2 lbs", status: "completed", adjustment: "Standard" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    {item.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <ChefHat className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.quantity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.adjustment.includes("-") ? "destructive" : item.adjustment.includes("+") ? "default" : "secondary"}>
                    {item.adjustment}
                  </Badge>
                  <Button 
                    variant={item.status === "completed" ? "outline" : "default"} 
                    size="sm"
                  >
                    {item.status === "completed" ? "Undo" : "Mark Complete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Prep Overview</CardTitle>
          <CardDescription>Projected ingredient needs for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { ingredient: "Sushi Rice", total: "95 lbs", daily: "13.6 lbs/day", trend: "stable" },
              { ingredient: "Tuna", total: "52 lbs", daily: "7.4 lbs/day", trend: "down" },
              { ingredient: "Salmon", total: "68 lbs", daily: "9.7 lbs/day", trend: "up" },
              { ingredient: "Avocado", total: "140 units", daily: "20 units/day", trend: "stable" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-semibold">{item.ingredient}</div>
                  <div className="text-sm text-muted-foreground">{item.daily}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.total}</div>
                  <Badge variant="outline" className="mt-1">
                    {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"} {item.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waste Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Analysis</CardTitle>
          <CardDescription>Track prep accuracy and reduce waste</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Waste tracking chart will be rendered here
        </CardContent>
      </Card>
    </div>
  );
}
