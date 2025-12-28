import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Cloud, TrendingUp, AlertCircle } from "lucide-react";

export default function Forecasting() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Forecasting</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered predictions based on historical data and weather patterns
          </p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Generate Forecast
        </Button>
      </div>

      {/* Forecast Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,850</div>
            <p className="text-xs text-muted-foreground">
              Confidence: <span className="text-green-600 font-medium">85%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow's Forecast</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,200</div>
            <p className="text-xs text-muted-foreground">
              Sunny weather expected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Ahead</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$21,500</div>
            <p className="text-xs text-muted-foreground">
              7-day projection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            AI Forecast Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            <strong>Saturday forecast: $3,500 (90% confidence).</strong> Factors: Weekend pattern (+$800), 
            sunny weather forecast (+$200), recent uptrend (+$150). Recommend prepping 40% more than 
            weekday baseline. Rain is expected Monday, which typically reduces sales by 25-30%.
          </p>
        </CardContent>
      </Card>

      {/* 7-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
          <CardDescription>Predicted sales with weather conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { day: "Monday", date: "Dec 30", sales: "$2,400", weather: "Rainy", confidence: "78%" },
              { day: "Tuesday", date: "Dec 31", sales: "$2,650", weather: "Cloudy", confidence: "82%" },
              { day: "Wednesday", date: "Jan 1", sales: "$3,100", weather: "Sunny", confidence: "88%" },
              { day: "Thursday", date: "Jan 2", sales: "$2,800", weather: "Partly Cloudy", confidence: "85%" },
              { day: "Friday", date: "Jan 3", sales: "$3,400", weather: "Sunny", confidence: "90%" },
              { day: "Saturday", date: "Jan 4", sales: "$3,500", weather: "Sunny", confidence: "90%" },
              { day: "Sunday", date: "Jan 5", sales: "$3,200", weather: "Cloudy", confidence: "87%" },
            ].map((forecast) => (
              <div
                key={forecast.day}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="font-semibold">{forecast.day}</div>
                    <div className="text-sm text-muted-foreground">{forecast.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{forecast.weather}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-lg">{forecast.sales}</div>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {forecast.confidence}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast vs Actual</CardTitle>
          <CardDescription>Compare predictions with actual sales performance</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          Forecast comparison chart will be rendered here
        </CardContent>
      </Card>
    </div>
  );
}
