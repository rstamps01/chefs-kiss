import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat, Download, AlertCircle, Loader2, TrendingUp, Package, Printer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import "./PrepPlanning.print.css";

export default function PrepPlanning() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [safetyBuffer, setSafetyBuffer] = useState<number>(10);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [multiDayMode, setMultiDayMode] = useState<boolean>(false);
  const [daysCount, setDaysCount] = useState<number>(3);

  // Fetch user restaurant and locations
  const { data: restaurant } = trpc.restaurant.get.useQuery();
  const { data: locations = [] } = trpc.restaurant.locations.useQuery();

  // Auto-select first location
  if (!selectedLocation && locations.length > 0) {
    setSelectedLocation(locations[0].id);
  }

  // Fetch single-day prep plan
  const { data: prepPlan, isLoading: isSingleDayLoading, refetch: refetchSingleDay, isRefetching: isRefetchingSingleDay } = trpc.prepPlanning.generate.useQuery(
    {
      locationId: selectedLocation ?? 0,
      targetDate,
      safetyBufferPercent: safetyBuffer,
    },
    {
      enabled: !!selectedLocation && !multiDayMode,
    }
  );

  // Fetch multi-day prep plan
  const { data: multiDayPlan, isLoading: isMultiDayLoading, refetch: refetchMultiDay, isRefetching: isRefetchingMultiDay } = trpc.prepPlanning.multiDay.useQuery(
    {
      locationId: selectedLocation ?? 0,
      startDate: targetDate,
      days: daysCount,
      safetyBufferPercent: safetyBuffer,
    },
    {
      enabled: !!selectedLocation && multiDayMode,
    }
  );

  // Unified loading and refetch states
  const isLoading = multiDayMode ? isMultiDayLoading : isSingleDayLoading;
  const isRefetching = multiDayMode ? isRefetchingMultiDay : isRefetchingSingleDay;
  const refetch = multiDayMode ? refetchMultiDay : refetchSingleDay;

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

  // Group recommendations by category
  const groupedByCategory = useMemo(() => {
    if (!prepPlan) return new Map();

    const groups = new Map<string, typeof prepPlan.recommendations>();
    prepPlan.recommendations.forEach((rec) => {
      const category = rec.category || "Uncategorized";
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(rec);
    });

    // Sort categories alphabetically
    return new Map(Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b)));
  }, [prepPlan]);

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
      ["Category", "Ingredient", "Pieces", "Recommended Qty", "Safety Buffer", "Total with Buffer", "Unit"],
      ...prepPlan.recommendations.map((rec: any) => [
        rec.category || "Uncategorized",
        rec.ingredientName,
        rec.pieces?.toString() || "",
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-only header */}
      <div className="hidden print:block">
        <h1 className="print-title">Chef's Kiss - Prep Plan</h1>
        <p className="print-date">
          {formattedDate} | Location: {locations.find(l => l.id === selectedLocation)?.name || "N/A"}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prep Planning</h1>
          <p className="text-muted-foreground mt-2">
            Daily ingredient prep recommendations based on sales forecasts
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint} disabled={!prepPlan}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
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
      <div className="grid gap-4 md:grid-cols-4 print:hidden">
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
          <Label htmlFor="date-select">{multiDayMode ? "Start Date" : "Prep Date"}</Label>
          <Input
            id="date-select"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode-select">Planning Mode</Label>
          <Select
            value={multiDayMode ? `multi-${daysCount}` : "single"}
            onValueChange={(value) => {
              if (value === "single") {
                setMultiDayMode(false);
              } else {
                setMultiDayMode(true);
                setDaysCount(parseInt(value.replace("multi-", "")));
              }
            }}
          >
            <SelectTrigger id="mode-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Day</SelectItem>
              <SelectItem value="multi-3">Next 3 Days</SelectItem>
              <SelectItem value="multi-7">This Week (7 days)</SelectItem>
              <SelectItem value="multi-14">Next 2 Weeks</SelectItem>
            </SelectContent>
          </Select>
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
      ) : (!prepPlan && !multiDayPlan) ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Select a location and date to generate prep plan</p>
          </CardContent>
        </Card>
      ) : multiDayMode && multiDayPlan ? (
        <MultiDayPrepView 
          multiDayPlan={multiDayPlan} 
          safetyBuffer={safetyBuffer}
          completedItems={completedItems}
          setCompletedItems={setCompletedItems}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
        />
      ) : prepPlan ? (
        <>
          {/* Metrics */}
          <div className="grid gap-4 md:grid-cols-3 print:hidden">
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
          <Card className="border-blue-200 bg-blue-50/50 print:hidden">
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

          {/* Prep List by Category */}
          <div className="space-y-6">
            {Array.from(groupedByCategory.entries()).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category}</span>
                    <Badge variant="outline">{items.length} items</Badge>
                  </CardTitle>
                  <CardDescription>
                    Prep tasks for {category.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((rec: any) => {
                      const isCompleted = completedItems.has(rec.ingredientId);
                      return (
                        <div key={rec.ingredientId} className="border rounded-lg">
                          <div
                            className={`flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                              isCompleted ? "opacity-60 bg-green-50/50" : ""
                            }`}
                            onClick={() => {
                              setExpandedItems((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(rec.ingredientId)) {
                                  newSet.delete(rec.ingredientId);
                                } else {
                                  newSet.add(rec.ingredientId);
                                }
                                return newSet;
                              });
                            }}
                          >
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={(checked) => {
                                setCompletedItems((prev) => {
                                  const newSet = new Set(prev);
                                  if (checked) {
                                    newSet.add(rec.ingredientId);
                                  } else {
                                    newSet.delete(rec.ingredientId);
                                  }
                                  return newSet;
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                  <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className={`font-semibold text-lg ${
                                    isCompleted ? "line-through" : ""
                                  }`}>
                                    {rec.ingredientName}
                                  </div>
                                  <div className="flex gap-4 mt-1">
                                    {rec.pieces && (
                                      <div className="text-sm">
                                        <span className="font-semibold text-primary">{rec.pieces} pieces</span>
                                        {rec.pieceWeightOz && (
                                          <span className="text-muted-foreground ml-1">(~{rec.pieceWeightOz}oz each)</span>
                                        )}
                                      </div>
                                    )}
                                    <div className="text-sm">
                                      <span className="font-semibold">Total: {rec.totalWithBuffer} {rec.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">
                                  {rec.recipes.length} recipe{rec.recipes.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {expandedItems.has(rec.ingredientId) && (
                            <div className="px-4 pb-4 pt-2 bg-muted/30 border-t">
                              <div className="text-sm font-semibold mb-2">Used in recipes:</div>
                              <div className="space-y-2">
                                {rec.recipes.map((recipe: any) => (
                                  <div key={recipe.recipeId} className="flex items-center justify-between p-2 bg-background rounded">
                                    <div>
                                      <div className="font-medium">{recipe.recipeName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {recipe.estimatedServings} servings × {(recipe.ingredientQuantity / recipe.estimatedServings).toFixed(2)} {rec.unit} each
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">{recipe.ingredientQuantity.toFixed(1)} {rec.unit}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Predicted Dishes for the Day */}
          {topRecipes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Predicted Dishes for {formattedDate}</span>
                  <Badge variant="outline">{topRecipes.length} dishes</Badge>
                </CardTitle>
                <CardDescription>
                  Complete list of recipes expected based on sales forecast
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {topRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                          <ChefHat className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{recipe.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{recipe.totalServings}</div>
                        <div className="text-xs text-muted-foreground">servings</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

// Multi-Day Prep View Component
function MultiDayPrepView({ 
  multiDayPlan, 
  safetyBuffer,
  completedItems,
  setCompletedItems,
  expandedItems,
  setExpandedItems 
}: {
  multiDayPlan: any;
  safetyBuffer: number;
  completedItems: Set<number>;
  setCompletedItems: (items: Set<number>) => void;
  expandedItems: Set<number>;
  setExpandedItems: (items: Set<number>) => void;
}) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const toggleDayExpansion = (ingredientId: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(ingredientId)) {
      newExpanded.delete(ingredientId);
    } else {
      newExpanded.add(ingredientId);
    }
    setExpandedDays(newExpanded);
  };

  // Group ingredients by category
  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, typeof multiDayPlan.ingredients>();
    multiDayPlan.ingredients.forEach((ing: any) => {
      const category = ing.category || "Uncategorized";
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(ing);
    });
    return new Map(Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b)));
  }, [multiDayPlan]);

  return (
    <>
      {/* Multi-Day Metrics */}
      <div className="grid gap-4 md:grid-cols-3 print:hidden">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecast Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${multiDayPlan.metrics.totalForecastRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${multiDayPlan.metrics.averageDailyRevenue.toFixed(0)}/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{multiDayPlan.metrics.totalIngredients}</div>
            <p className="text-xs text-muted-foreground">Across {multiDayPlan.totalDays} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{multiDayPlan.totalDays} Days</div>
            <p className="text-xs text-muted-foreground">
              {new Date(multiDayPlan.startDate).toLocaleDateString()} - {new Date(multiDayPlan.endDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consolidated Prep List */}
      <div className="space-y-6">
        {Array.from(groupedByCategory.entries()).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{category}</span>
                <Badge variant="outline">{items.length} items</Badge>
              </CardTitle>
              <CardDescription>
                Consolidated prep for {category.toLowerCase()} across {multiDayPlan.totalDays} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((ingredient: any) => (
                  <div
                    key={ingredient.ingredientId}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => toggleDayExpansion(ingredient.ingredientId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={completedItems.has(ingredient.ingredientId)}
                          onCheckedChange={(checked) => {
                            const newCompleted = new Set(completedItems);
                            if (checked) {
                              newCompleted.add(ingredient.ingredientId);
                            } else {
                              newCompleted.delete(ingredient.ingredientId);
                            }
                            setCompletedItems(newCompleted);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">{ingredient.ingredientName}</h4>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-muted-foreground">
                              <strong>Total Needed:</strong> {ingredient.totalWithBuffer} {ingredient.unit}
                              {ingredient.pieces && (
                                <> ({ingredient.pieces} pieces × ~{ingredient.pieceWeightOz}oz each)</>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Base Quantity:</strong> {ingredient.totalQuantityAllDays} {ingredient.unit} + {safetyBuffer}% buffer
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Day-by-Day Breakdown */}
                    {expandedDays.has(ingredient.ingredientId) && (
                      <div className="mt-4 pl-9 space-y-2 border-l-2 border-blue-200">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Day-by-Day Breakdown:</p>
                        {ingredient.dayBreakdowns.map((day: any) => (
                          <div key={day.date} className="pl-4 py-2 bg-accent/30 rounded">
                            <p className="text-sm font-medium">
                              {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}:
                              <span className="ml-2 text-foreground">{day.quantity} {ingredient.unit}</span>
                            </p>
                            <ul className="mt-1 ml-4 text-xs text-muted-foreground space-y-1">
                              {day.recipes.map((recipe: any) => (
                                <li key={recipe.recipeId}>
                                  • {recipe.recipeName} ({recipe.estimatedServings} servings) - {recipe.ingredientQuantity} {ingredient.unit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
