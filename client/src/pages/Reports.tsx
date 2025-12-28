import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate professional operational analysis reports
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate New Report
        </Button>
      </div>

      {/* Report Templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "Weekly Operations Summary",
            description: "Sales, prep efficiency, and weather impact analysis",
            icon: TrendingUp,
            frequency: "Weekly"
          },
          {
            name: "Monthly Performance Report",
            description: "Comprehensive monthly metrics and trends",
            icon: Calendar,
            frequency: "Monthly"
          },
          {
            name: "Forecast Accuracy Report",
            description: "Compare predictions vs actual performance",
            icon: FileText,
            frequency: "On-demand"
          },
          {
            name: "Waste Analysis Report",
            description: "Track food waste and prep optimization",
            icon: TrendingUp,
            frequency: "Weekly"
          },
          {
            name: "Menu Performance Report",
            description: "Analyze sales by menu item and category",
            icon: FileText,
            frequency: "Monthly"
          },
          {
            name: "Custom Report",
            description: "Build a custom report with selected metrics",
            icon: FileText,
            frequency: "On-demand"
          },
        ].map((template, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{template.frequency}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Weekly Operations Summary - Dec 16-22",
                date: "Dec 23, 2025",
                size: "2.4 MB",
                type: "PDF"
              },
              {
                name: "Monthly Performance Report - November 2025",
                date: "Dec 1, 2025",
                size: "3.8 MB",
                type: "PDF"
              },
              {
                name: "Forecast Accuracy Report - Q4 2025",
                date: "Nov 28, 2025",
                size: "1.9 MB",
                type: "PDF"
              },
              {
                name: "Waste Analysis Report - Week 50",
                date: "Nov 15, 2025",
                size: "1.2 MB",
                type: "PDF"
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {report.date} • {report.size} • {report.type}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Generated this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Weekly Ops</div>
            <p className="text-xs text-muted-foreground">12 reports generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 days ago</div>
            <p className="text-xs text-muted-foreground">Dec 23, 2025</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
