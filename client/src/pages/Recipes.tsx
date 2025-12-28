import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch recipes from database
  const { data: recipes, isLoading } = trpc.recipes.list.useQuery();

  // Filter recipes based on search
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    if (!searchQuery) return recipes;
    
    const query = searchQuery.toLowerCase();
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(query) ||
      (recipe.description && recipe.description.toLowerCase().includes(query))
    );
  }, [recipes, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!recipes || recipes.length === 0) {
      return {
        totalRecipes: 0,
        avgFoodCost: 0,
        avgMargin: 0,
      };
    }

    let totalCost = 0;
    let totalPrice = 0;
    let validRecipes = 0;

    recipes.forEach(recipe => {
      const sellingPrice = parseFloat(recipe.sellingPrice || "0");
      if (sellingPrice > 0) {
        // Calculate ingredient cost
        const ingredientCost = recipe.ingredients.reduce((sum, ing) => {
          const quantity = parseFloat(ing.quantity || "0");
          const costPerUnit = parseFloat(ing.costPerUnit || "0");
          return sum + (quantity * costPerUnit);
        }, 0);

        totalCost += ingredientCost;
        totalPrice += sellingPrice;
        validRecipes++;
      }
    });

    const avgFoodCost = validRecipes > 0 ? (totalCost / totalPrice) * 100 : 0;
    const avgMargin = validRecipes > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;

    return {
      totalRecipes: recipes.length,
      avgFoodCost: Math.round(avgFoodCost),
      avgMargin: Math.round(avgMargin),
    };
  }, [recipes]);

  // Calculate individual recipe metrics
  const getRecipeMetrics = (recipe: any) => {
    const sellingPrice = parseFloat(recipe.sellingPrice || "0");
      const ingredientCost = recipe.ingredients.reduce((sum: number, ing: any) => {
        const quantity = parseFloat(ing.quantity || "0");
        const costPerUnit = parseFloat(ing.costPerUnit || "0");
        return sum + (quantity * costPerUnit);
      }, 0);

    const foodCostPercent = sellingPrice > 0 ? (ingredientCost / sellingPrice) * 100 : 0;
    const margin = sellingPrice > 0 ? ((sellingPrice - ingredientCost) / sellingPrice) * 100 : 0;

    return {
      cost: ingredientCost.toFixed(2),
      foodCostPercent: Math.round(foodCostPercent),
      margin: Math.round(margin),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipe Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage menu items and their ingredient requirements
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRecipes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              {searchQuery ? "No recipes found matching your search." : "No recipes yet. Add your first recipe to get started."}
            </p>
            {!searchQuery && (
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Recipe
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recipe List */}
      {!isLoading && filteredRecipes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => {
            const metrics = getRecipeMetrics(recipe);
            
            return (
              <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      <CardDescription>{recipe.description || "No description"}</CardDescription>
                    </div>
                    <Badge variant="secondary">{metrics.margin}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ingredients:</span>
                      <span className="font-medium">{recipe.ingredients.length} items</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-medium">${metrics.cost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">${parseFloat(recipe.sellingPrice || "0").toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Statistics */}
      {!isLoading && recipes && recipes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Recipes</CardDescription>
              <CardTitle className="text-3xl">{stats.totalRecipes}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Across {new Set(recipes.map(r => r.category).filter(Boolean)).size} categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Food Cost</CardDescription>
              <CardTitle className="text-3xl">{stats.avgFoodCost}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Target: 28-35%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Margin</CardDescription>
              <CardTitle className="text-3xl">{stats.avgMargin}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.avgMargin >= 60 ? "Above" : "Below"} industry average
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
