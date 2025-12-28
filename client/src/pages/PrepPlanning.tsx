import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChefHat, Download, AlertCircle, Loader2, TrendingUp, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";

export default function PrepPlanning() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [safetyBuffer, setSafetyBuffer] = useState<number>(10);

  // Fetch user restaurant and locations
  const { data: restaurant } = trpc.restaurant.get.useQuery();
  const { data: locations = [] } = trpc.restaurant.locations.useQuery();

  // Auto-select first location
  if (!selectedLocation && locations.length > 0) {
    setSelectedLocation(locations[0].id);
  }

  // Fetch prep plan
  const { data: prepPlan, isLoading, refetch, isRefetching } = trpc.prepPlanning.generate.useQuery(
    {
      locationId: selectedLocation ?? 0,
      targetDate,
      safetyBufferPercent: safetyBuffer,
    },
    {
      enabled: !!selectedLocation,
    }
  );

  // Format date for display
  const formattedDate = useMemo(() => {
    const date = new Date(targetDate);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [targetDate]);

  // Group recommendations by recipe
  const topRecipes = useMemo(() => {
    if (!prepPlan) return [];

    const recipeMap = new Map<number, {
      id: number;
      name: string;
      totalServings: number;
    }>();

    prepPlan.recommendations.forEach((rec) => {
      rec.recipes.forEach((recipe) => {
        if (!recipeMap.has(recipe.recipeId)) {
          recipeMap.set(recipe.recipeId, {
            id: recipe.recipeId,
            name: recipe.recipeName,
            totalServings: 0,
          });
        }
        const existing = recipeMap.get(recipe.recipeId)!;
        existing.totalServings = Math.max(existing.totalServings, recipe.estimatedServings);
      });
    });

    return Array.from(recipeMap.values())
      .sort((a, b) => b.totalServings - a.totalServings)
      .slice(0, 5);
  }, [prepPlan]);

  const handleExport = () => {
    if (!prepPlan) return;

    // Create CSV content
    const csvRows = [
      ["Ingredient", "Recommended Qty", "Safety Buffer", "Total with Buffer", "Unit"],
      ...prepPlan.recommendations.map((rec) => [
        rec.ingredientName,
        rec.recommendedQuantity.toString(),
        rec.safetyBuffer.toString(),
        rec.totalWithBuffer.toString(),
        rec.unit,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prep-plan-${targetDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <Button variant="outline" onClick={handleExport} disabled={!prepPlan}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => refetch()} disabled={isRefetching || !selectedLocation}>
            {isRefetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ChefHat className="mr-2 h-4 w-4" />
            )}
            Regenerate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
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
          <Label htmlFor="date-select">Prep Date</Label>
          <Input
            id="date-select"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buffer-select">Safety Buffer</Label>
          <Select
            value={safetyBuffer.toString()}
            onValueChange={(value) => setSafetyBuffer(parseInt(value))}
          >
            <SelectTrigger id="buffer-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5% (Tight)</SelectItem>
              <SelectItem value="10">10% (Standard)</SelectItem>
              <SelectItem value="15">15% (Conservative)</SelectItem>
              <SelectItem value="20">20% (Very Safe)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !prepPlan ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Select a location and date to generate prep plan</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${prepPlan.forecastRevenue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">
                  Confidence: {prepPlan.metrics.confidenceLevel}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{prepPlan.metrics.totalIngredients}</div>
                <p className="text-xs text-muted-foreground">Items to prepare</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waste Reduction</CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {prepPlan.metrics.estimatedWasteReduction}%
                </div>
                <p className="text-xs text-muted-foreground">vs. over-preparing</p>
              </CardContent>
            </Card>
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
                <strong>Forecast: ${prepPlan.forecastRevenue.toFixed(0)} ({prepPlan.metrics.confidenceLevel}% confidence).</strong>{" "}
                Prep plan includes {prepPlan.metrics.totalIngredients} ingredients with {safetyBuffer}% safety buffer. 
                This approach reduces waste by {prepPlan.metrics.estimatedWasteReduction}% compared to traditional over-preparing methods.
                {topRecipes.length > 0 && (
                  <> Top predicted dishes: {topRecipes.map(r => r.name).join(", ")}.</>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Prep List */}
          <Card>
            <CardHeader>
              <CardTitle>Prep List for {formattedDate}</CardTitle>
              <CardDescription>
                Quantities calculated from forecast with {safetyBuffer}% safety buffer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prepPlan.recommendations.map((rec) => (
                  <div
                    key={rec.ingredientId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{rec.ingredientName}</div>
                        <div className="text-sm text-muted-foreground">
                          Base: {rec.recommendedQuantity} {rec.unit} + Buffer: {rec.safetyBuffer} {rec.unit}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {rec.totalWithBuffer} {rec.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rec.recipes.length} recipe{rec.recipes.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recipe Breakdown */}
          {topRecipes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Predicted Dishes</CardTitle>
                <CardDescription>Recipes driving ingredient requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                          <ChefHat className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{recipe.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Estimated servings needed
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{recipe.totalServings}</div>
                        <Badge variant="outline">servings</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
