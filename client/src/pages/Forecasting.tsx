import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, TrendingUp, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Forecasting() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [forecastDays, setForecastDays] = useState<number>(14);

  // Fetch user restaurant and locations
  const { data: restaurant } = trpc.restaurant.get.useQuery();
  const { data: locations = [] } = trpc.restaurant.locations.useQuery();

  // Auto-select first location
  if (!selectedLocation && locations.length > 0) {
    setSelectedLocation(locations[0].id);
  }

  // Fetch forecast data
  const { data: forecastData, isLoading, refetch, isRefetching } = trpc.forecasting.generate.useQuery(
    {
      locationId: selectedLocation ?? 0,
      daysAhead: forecastDays,
    },
    {
      enabled: !!selectedLocation,
    }
  );

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!forecastData) return null;

    const today = forecastData.forecasts[0];
    const tomorrow = forecastData.forecasts[1];
    const weekTotal = forecastData.forecasts.slice(0, 7).reduce((sum, f) => sum + f.predictedRevenue, 0);

    return { today, tomorrow, weekTotal };
  }, [forecastData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!forecastData) return null;

    return {
      labels: forecastData.forecasts.map((f) => {
        const date = new Date(f.date);
        return `${f.dayOfWeek.slice(0, 3)} ${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: "Predicted Revenue",
          data: forecastData.forecasts.map((f) => f.predictedRevenue),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Upper Confidence",
          data: forecastData.forecasts.map((f) => f.confidenceUpper),
          borderColor: "rgba(59, 130, 246, 0.3)",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
        },
        {
          label: "Lower Confidence",
          data: forecastData.forecasts.map((f) => f.confidenceLower),
          borderColor: "rgba(59, 130, 246, 0.3)",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  }, [forecastData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "$" + value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Forecasting</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered predictions based on historical data and day-of-week patterns
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isRefetching || !selectedLocation}>
          {isRefetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Regenerate
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location-select">Location</Label>
          <Select
            value={selectedLocation?.toString() ?? ""}
            onValueChange={(value) => setSelectedLocation(parseInt(value))}
          >
            <SelectTrigger id="location-select">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location: any) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="days-select">Forecast Period</Label>
          <Select
            value={forecastDays.toString()}
            onValueChange={(value) => setForecastDays(parseInt(value))}
          >
            <SelectTrigger id="days-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="14">Next 14 days</SelectItem>
              <SelectItem value="21">Next 21 days</SelectItem>
              <SelectItem value="30">Next 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !forecastData ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Select a location to view forecast</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Forecast Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tomorrow's Forecast</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summaryMetrics?.tomorrow.predictedRevenue.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryMetrics?.tomorrow.dayOfWeek}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Week Ahead</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summaryMetrics?.weekTotal.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">7-day projection</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(100 - forecastData.accuracy.mape).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  MAPE: {forecastData.accuracy.mape.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {forecastData.insights.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  AI Forecast Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {forecastData.insights.map((insight, index) => (
                    <p key={index} className="text-sm text-foreground">
                      {insight}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>
                Predicted sales with 95% confidence interval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Forecast Table */}
          <Card>
            <CardHeader>
              <CardTitle>{forecastDays}-Day Detailed Forecast</CardTitle>
              <CardDescription>Daily predictions with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecastData.forecasts.map((forecast) => {
                  const date = new Date(forecast.date);
                  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                  const confidenceRange = forecast.confidenceUpper - forecast.confidenceLower;
                  const confidencePercent = (
                    (1 - confidenceRange / forecast.predictedRevenue) *
                    100
                  ).toFixed(0);

                  return (
                    <div
                      key={forecast.date}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[100px]">
                          <div className="font-semibold">{forecast.dayOfWeek}</div>
                          <div className="text-sm text-muted-foreground">{formattedDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            ${forecast.predictedRevenue.toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${forecast.confidenceLower.toFixed(0)} - $
                            {forecast.confidenceUpper.toFixed(0)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground min-w-[80px] text-right">
                          {confidencePercent}% confidence
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
