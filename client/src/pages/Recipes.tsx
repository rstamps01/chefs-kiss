import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Loader2, ArrowUpDown, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { RecipeEditModal } from "@/components/RecipeEditModal";
import { RecipeCreateModal } from "@/components/RecipeCreateModal";
import { IngredientCreateModal } from "@/components/IngredientCreateModal";
import { IngredientEditModal } from "@/components/IngredientEditModal";
import { useToast } from "@/hooks/use-toast";

type RecipeSortOption = "name-asc" | "name-desc" | "price-high" | "price-low" | "category";
type IngredientSortOption = "name-asc" | "name-desc" | "cost-high" | "cost-low" | "category";

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipeSortBy, setRecipeSortBy] = useState<RecipeSortOption>("name-asc");
  const [ingredientSortBy, setIngredientSortBy] = useState<IngredientSortOption>("name-asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isIngredientCreateModalOpen, setIsIngredientCreateModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const { toast } = useToast();
  const utils = trpc.useUtils();
  
  // Fetch recipes from database
  const { data: recipes, isLoading: recipesLoading } = trpc.recipes.list.useQuery();
  
  // Fetch ingredients from database
  const { data: ingredients, isLoading: ingredientsLoading } = trpc.ingredients.list.useQuery();
  
  // Fetch category lists to determine category types
  const { data: recipeCategories = [] } = trpc.recipeCategories.listActive.useQuery();
  const { data: ingredientCategoryNames = [] } = trpc.recipeCategories.listIngredientCategories.useQuery();
  
  // Helper function to determine category type
  const getCategoryType = (categoryName: string): 'recipe' | 'ingredient' | 'unknown' => {
    const recipeCategoryNames = recipeCategories.map(cat => cat.name);
    const isRecipeCategory = recipeCategoryNames.includes(categoryName);
    const isIngredientCategory = ingredientCategoryNames.includes(categoryName);
    
    // If it's in both lists, prioritize Recipe category
    if (isRecipeCategory) return 'recipe';
    if (isIngredientCategory) return 'ingredient';
    return 'unknown';
  };
  
  // Delete recipe mutation
  const deleteRecipeMutation = trpc.recipes.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Recipe deleted",
        description: "The recipe has been removed successfully.",
      });
      utils.recipes.list.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete recipe",
        variant: "destructive",
      });
    },
  });
  
  // Delete ingredient mutation
  const deleteIngredientMutation = trpc.ingredients.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Ingredient deleted",
        description: "The ingredient has been removed successfully.",
      });
      utils.ingredients.list.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ingredient. It may be used in recipes.",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteRecipe = (recipeId: number, recipeName: string) => {
    if (confirm(`Are you sure you want to delete "${recipeName}"? This action cannot be undone.`)) {
      deleteRecipeMutation.mutate({ recipeId });
    }
  };
  
  const handleDeleteIngredient = async (ingredientId: number, ingredientName: string) => {
    try {
      // First check if ingredient is used in recipes
      const recipeUsage = await utils.client.ingredients.getRecipeUsage.query({ ingredientId });
      
      if (recipeUsage.length > 0) {
        // Show which recipes use this ingredient
        const recipeList = recipeUsage.map(r => `• ${r.recipeName} (${r.quantity} ${r.unit})`).join('\n');
        const message = `Cannot delete "${ingredientName}" because it is used in ${recipeUsage.length} recipe(s):\n\n${recipeList}\n\nPlease remove this ingredient from these recipes first.`;
        
        toast({
          title: "Cannot Delete Ingredient",
          description: message,
          variant: "destructive",
        });
        return;
      }
      
      // If not used, proceed with deletion
      if (confirm(`Are you sure you want to delete "${ingredientName}"?`)) {
        deleteIngredientMutation.mutate({ ingredientId });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check ingredient usage. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    
    // First filter by search query
    let filtered = recipes;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        (recipe.description && recipe.description.toLowerCase().includes(query))
      );
    }
    
    // Then filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(recipe => recipe.category === categoryFilter);
    }
    
    // Then sort
    const sorted = [...filtered];
    switch (recipeSortBy) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-high":
        sorted.sort((a, b) => {
          const priceA = parseFloat(a.sellingPrice || "0");
          const priceB = parseFloat(b.sellingPrice || "0");
          return priceB - priceA;
        });
        break;
      case "price-low":
        sorted.sort((a, b) => {
          const priceA = parseFloat(a.sellingPrice || "0");
          const priceB = parseFloat(b.sellingPrice || "0");
          return priceA - priceB;
        });
        break;
      case "category":
        sorted.sort((a, b) => {
          const catA = a.category || "";
          const catB = b.category || "";
          return catA.localeCompare(catB);
        });
        break;
    }
    
    return sorted;
  }, [recipes, searchQuery, recipeSortBy]);

  // Filter and sort ingredients
  const filteredIngredients = useMemo(() => {
    if (!ingredients) return [];
    
    // First filter by search query
    let filtered = ingredients;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = ingredients.filter(ingredient => 
        ingredient.name.toLowerCase().includes(query) ||
        (ingredient.category && ingredient.category.toLowerCase().includes(query))
      );
    }
    
    // Then sort
    const sorted = [...filtered];
    switch (ingredientSortBy) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "cost-high":
        sorted.sort((a, b) => {
          const costA = parseFloat(a.costPerUnit || "0");
          const costB = parseFloat(b.costPerUnit || "0");
          return costB - costA;
        });
        break;
      case "cost-low":
        sorted.sort((a, b) => {
          const costA = parseFloat(a.costPerUnit || "0");
          const costB = parseFloat(b.costPerUnit || "0");
          return costA - costB;
        });
        break;
      case "category":
        sorted.sort((a, b) => {
          const catA = a.category || "";
          const catB = b.category || "";
          return catA.localeCompare(catB);
        });
        break;
    }
    
    return sorted;
  }, [ingredients, searchQuery, ingredientSortBy]);

  // Calculate recipe statistics
  const recipeStats = useMemo(() => {
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
        // Calculate ingredient cost using convertedCost (accounts for unit conversions)
        const ingredientCost = recipe.ingredients.reduce((sum, ing) => {
          if (ing.convertedCost) {
            return sum + parseFloat(ing.convertedCost);
          }
          // Fallback for old data without conversions
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

  // Calculate individual recipe metrics using converted costs
  const getRecipeMetrics = (recipe: any) => {
    const sellingPrice = parseFloat(recipe.sellingPrice || "0");
    
    // Use convertedCost from backend if available, otherwise fallback to quantity * costPerUnit
    const ingredientCost = recipe.ingredients.reduce((sum: number, ing: any) => {
      if (ing.convertedCost) {
        return sum + parseFloat(ing.convertedCost);
      }
      // Fallback for old data
      const quantity = parseFloat(ing.quantity || "0");
      const costPerUnit = parseFloat(ing.costPerUnit || "0");
      return sum + (quantity * costPerUnit);
    }, 0);

    const foodCostPercent = sellingPrice > 0 ? (ingredientCost / sellingPrice) * 100 : 0;
    const margin = sellingPrice > 0 ? ((sellingPrice - ingredientCost) / sellingPrice) * 100 : 0;

    // Check for conversion warnings
    const hasConversionWarnings = recipe.ingredients.some((ing: any) => ing.conversionWarning);
    const conversionCount = recipe.ingredients.filter((ing: any) => ing.conversionApplied).length;

    return {
      cost: ingredientCost.toFixed(2),
      foodCostPercent: Math.round(foodCostPercent),
      margin: Math.round(margin),
      hasConversionWarnings,
      conversionCount,
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
      </div>

      <Tabs defaultValue="recipes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        </TabsList>

        {/* RECIPES TAB */}
        <TabsContent value="recipes" className="space-y-6">
          {/* Statistics */}
          {!recipesLoading && recipes && recipes.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Recipes</CardDescription>
                  <CardTitle className="text-3xl">{recipeStats.totalRecipes}</CardTitle>
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
                  <CardTitle className="text-3xl">{recipeStats.avgFoodCost}%</CardTitle>
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
                  <CardTitle className="text-3xl">{recipeStats.avgMargin}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {recipeStats.avgMargin >= 60 ? "Above" : "Below"} industry average
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="font-medium">All Categories</span>
                  </SelectItem>
                  <div className="my-1 h-px bg-border" />
                  {Array.from(new Set(recipes?.map(r => r.category).filter((cat): cat is string => Boolean(cat)))).sort((a, b) => a.localeCompare(b)).map((category) => {
                    const categoryType = getCategoryType(category);
                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={
                              categoryType === 'recipe' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-xs'
                                : categoryType === 'ingredient'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 text-xs'
                                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 text-xs'
                            }
                          >
                            {category}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Select value={recipeSortBy} onValueChange={(value) => setRecipeSortBy(value as RecipeSortOption)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-high">Price (High-Low)</SelectItem>
                  <SelectItem value="price-low">Price (Low-High)</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Recipe
            </Button>
          </div>

          {/* Loading State */}
          {recipesLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty State */}
          {!recipesLoading && filteredRecipes.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  {searchQuery ? "No recipes found matching your search." : "No recipes yet. Add your first recipe to get started."}
                </p>
                {!searchQuery && (
                  <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Recipe
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recipe List */}
          {!recipesLoading && filteredRecipes.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe) => {
                const metrics = getRecipeMetrics(recipe);
                
                return (
                  <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{recipe.name}</CardTitle>
                            {recipe.category && (() => {
                              const categoryType = getCategoryType(recipe.category);
                              return (
                                <Badge 
                                  variant="outline"
                                  className={
                                    categoryType === 'recipe' 
                                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                                      : categoryType === 'ingredient'
                                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
                                      : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800'
                                  }
                                >
                                  {recipe.category}
                                </Badge>
                              );
                            })()}
                          </div>
                          <CardDescription>{recipe.description || "No description"}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2">{metrics.margin}%</Badge>
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
                        {metrics.conversionCount > 0 && (
                          <div className="flex items-center gap-2 pt-2 text-xs text-blue-600 dark:text-blue-400">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <span>{metrics.conversionCount} unit conversion{metrics.conversionCount > 1 ? 's' : ''} applied</span>
                          </div>
                        )}
                        {metrics.hasConversionWarnings && (
                          <div className="flex items-center gap-2 pt-2 text-xs text-amber-600 dark:text-amber-400">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Missing unit conversions</span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setEditingRecipe(recipe)}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                            disabled={deleteRecipeMutation.isPending}
                          >
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


        </TabsContent>

        {/* INGREDIENTS TAB */}
        <TabsContent value="ingredients" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ingredients..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={ingredientSortBy} onValueChange={(value) => setIngredientSortBy(value as IngredientSortOption)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="cost-high">Cost (High-Low)</SelectItem>
                  <SelectItem value="cost-low">Cost (Low-High)</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsIngredientCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Ingredient
            </Button>
          </div>

          {/* Loading State */}
          {ingredientsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty State */}
          {!ingredientsLoading && filteredIngredients.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  {searchQuery ? "No ingredients found matching your search." : "No ingredients yet. Add your first ingredient to get started."}
                </p>
                {!searchQuery && (
                  <Button className="mt-4" onClick={() => setIsIngredientCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Ingredient
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ingredient List */}
          {!ingredientsLoading && filteredIngredients.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIngredients.map((ingredient) => (
                <Card key={ingredient.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                        <CardDescription>{ingredient.category || "Uncategorized"}</CardDescription>
                      </div>
                      {ingredient.costPerUnit && (
                        <Badge variant="secondary">
                          ${parseFloat(ingredient.costPerUnit).toFixed(2)}/{ingredient.unitDisplayName || ingredient.unit}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Unit Type:</span>
                        <span className="font-medium">{ingredient.unitDisplayName || ingredient.unit}</span>
                      </div>
                      {ingredient.costPerUnit && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cost Per Unit:</span>
                          <span className="font-medium">${parseFloat(ingredient.costPerUnit).toFixed(4)}</span>
                        </div>
                      )}
                      {ingredient.supplier && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Supplier:</span>
                          <span className="font-medium truncate ml-2">{ingredient.supplier}</span>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingIngredient(ingredient)}
                        >
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDeleteIngredient(ingredient.id, ingredient.name)}
                          disabled={deleteIngredientMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Ingredient Statistics */}
          {!ingredientsLoading && ingredients && ingredients.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Ingredients</CardDescription>
                  <CardTitle className="text-3xl">{ingredients.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {new Set(ingredients.map(i => i.category).filter(Boolean)).size} categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>With Cost Data</CardDescription>
                  <CardTitle className="text-3xl">
                    {ingredients.filter(i => i.costPerUnit).length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((ingredients.filter(i => i.costPerUnit).length / ingredients.length) * 100)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>With Supplier Info</CardDescription>
                  <CardTitle className="text-3xl">
                    {ingredients.filter(i => i.supplier).length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((ingredients.filter(i => i.supplier).length / ingredients.length) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Recipe Edit Modal */}
      {editingRecipe && (
        <RecipeEditModal
          recipe={editingRecipe}
          open={!!editingRecipe}
          onOpenChange={(open) => !open && setEditingRecipe(null)}
        />
      )}
      
      {/* Recipe Create Modal */}
      <RecipeCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => utils.recipes.list.invalidate()}
      />
      
      {/* Ingredient Create Modal */}
      <IngredientCreateModal
        open={isIngredientCreateModalOpen}
        onOpenChange={setIsIngredientCreateModalOpen}
      />
      
      {/* Ingredient Edit Modal */}
      {editingIngredient && (
        <IngredientEditModal
          ingredient={editingIngredient}
          open={!!editingIngredient}
          onOpenChange={(open) => !open && setEditingIngredient(null)}
        />
      )}
    </div>
  );
}
