import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar, AlertCircle } from "lucide-react";
import { trpc } from '@/lib/trpc';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Analytics() {
  const { data: locations } = trpc.restaurant.locations.useQuery();
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Auto-select first location
  useEffect(() => {
    if (locations && locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    if (dateRange === '7d') {
      start.setDate(end.getDate() - 7);
    } else if (dateRange === '30d') {
      start.setDate(end.getDate() - 30);
    } else if (dateRange === '90d') {
      start.setDate(end.getDate() - 90);
    } else {
      return { startDate: undefined, endDate: undefined };
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }, [dateRange]);

  // Fetch analytics data
  const { data: summary, isLoading: summaryLoading } = trpc.analytics.summary.useQuery(
    { locationId: selectedLocationId!, startDate, endDate },
    { enabled: !!selectedLocationId }
  );

  const { data: dailySales, isLoading: dailySalesLoading } = trpc.analytics.dailySales.useQuery(
    { locationId: selectedLocationId!, startDate, endDate },
    { enabled: !!selectedLocationId }
  );

  const { data: salesByDay, isLoading: salesByDayLoading } = trpc.analytics.salesByDayOfWeek.useQuery(
    { locationId: selectedLocationId!, startDate, endDate },
    { enabled: !!selectedLocationId }
  );

  const { data: availableDateRange } = trpc.analytics.dateRange.useQuery(
    { locationId: selectedLocationId! },
    { enabled: !!selectedLocationId }
  );

  // Format currency
  const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  // Prepare daily sales chart data
  const dailySalesChartData = useMemo(() => {
    if (!dailySales || dailySales.length === 0) return null;

    const sortedData = [...dailySales].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return {
      labels: sortedData.map(d => {
        const date = d.date instanceof Date ? d.date : new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Total Sales',
          data: sortedData.map(d => parseFloat(d.totalSales)),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [dailySales]);

  // Prepare day of week chart data
  const dayOfWeekChartData = useMemo(() => {
    if (!salesByDay || salesByDay.length === 0) return null;

    // Sort by day of week (0=Sunday to 6=Saturday)
    const sortedData = [...salesByDay].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return {
      labels: sortedData.map(d => DAY_NAMES[d.dayOfWeek]),
      datasets: [
        {
          label: 'Average Sales',
          data: sortedData.map(d => parseFloat(d.avgSales || '0')),
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',   // Sunday - red
            'rgba(59, 130, 246, 0.8)',  // Monday - blue
            'rgba(16, 185, 129, 0.8)',  // Tuesday - green
            'rgba(245, 158, 11, 0.8)',  // Wednesday - amber
            'rgba(139, 92, 246, 0.8)',  // Thursday - purple
            'rgba(236, 72, 153, 0.8)',  // Friday - pink
            'rgba(20, 184, 166, 0.8)',  // Saturday - teal
          ],
        },
      ],
    };
  }, [salesByDay]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Avg: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  const hasData = summary && summary.recordCount > 0;
  const isLoading = summaryLoading || dailySalesLoading || salesByDayLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your sales performance, trends, and key metrics
          </p>
        </div>
      </div>

      {/* Location and Date Range Selectors */}
      <div className="flex gap-4 flex-wrap">
        <div className="w-64">
          <Label htmlFor="location-select">Location</Label>
          <Select
            value={selectedLocationId?.toString() || ''}
            onValueChange={(value) => setSelectedLocationId(parseInt(value))}
          >
            <SelectTrigger id="location-select">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Label htmlFor="date-range-select">Date Range</Label>
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger id="date-range-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {availableDateRange && availableDateRange.minDate && availableDateRange.maxDate && (
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data available: {new Date(availableDateRange.minDate).toLocaleDateString()} - {new Date(availableDateRange.maxDate).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* No Data Alert */}
      {!isLoading && !hasData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Sales Data Available</AlertTitle>
          <AlertDescription>
            Import your POS data to see analytics and insights. Go to <strong>Data Import</strong> to upload your sales data.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      {hasData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary?.totalSales)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.recordCount} days of data
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.totalOrders?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary?.avgOrderValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per transaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    summary?.totalSales && summary?.recordCount
                      ? parseFloat(summary.totalSales) / summary.recordCount
                      : 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average per day
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Sales Trend Chart */}
          {dailySalesChartData && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales Trend</CardTitle>
                <CardDescription>Sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Line data={dailySalesChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Day of Week Analysis */}
          {dayOfWeekChartData && (
            <Card>
              <CardHeader>
                <CardTitle>Sales by Day of Week</CardTitle>
                <CardDescription>Average sales performance by weekday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Bar data={dayOfWeekChartData} options={barChartOptions} />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      )}
    </div>
  );
}
