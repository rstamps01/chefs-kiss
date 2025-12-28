import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ChefHat, Plus, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

/**
 * Form to add a new recipe with ingredients
 */
export default function AddRecipeForm() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: ingredients, isLoading: ingredientsLoading } = trpc.ingredients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [servings, setServings] = useState<number>(1);
  const [prepTime, setPrepTime] = useState<number | undefined>();
  const [cookTime, setCookTime] = useState<number | undefined>();
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [description, setDescription] = useState("");

  // Ingredients state
  const [selectedIngredients, setSelectedIngredients] = useState<Array<{
    ingredientId: number;
    quantity: number;
    unit: string;
  }>>([]);

  // Ingredient selector state
  const [currentIngredientId, setCurrentIngredientId] = useState<string>("");
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [currentUnit, setCurrentUnit] = useState<string>("");

  // Mutation
  const createRecipeMutation = trpc.recipes.create.useMutation({
    onSuccess: () => {
      toast.success("Recipe created successfully!");
      setLocation("/recipes-view");
    },
    onError: (error) => {
      toast.error(`Failed to create recipe: ${error.message}`);
    },
  });

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to add recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (authLoading || ingredientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAddIngredient = () => {
    if (!currentIngredientId || !currentQuantity || !currentUnit) {
      toast.error("Please fill in all ingredient fields");
      return;
    }

    const ingredientId = parseInt(currentIngredientId);
    const ingredient = ingredients?.find(i => i.id === ingredientId);
    
    if (!ingredient) {
      toast.error("Invalid ingredient selected");
      return;
    }

    // Check if already added
    if (selectedIngredients.some(i => i.ingredientId === ingredientId)) {
      toast.error("Ingredient already added");
      return;
    }

    setSelectedIngredients([...selectedIngredients, {
      ingredientId,
      quantity: currentQuantity,
      unit: currentUnit,
    }]);

    // Reset selector
    setCurrentIngredientId("");
    setCurrentQuantity(1);
    setCurrentUnit("");
    toast.success(`Added ${ingredient.name}`);
  };

  const handleRemoveIngredient = (ingredientId: number) => {
    setSelectedIngredients(selectedIngredients.filter(i => i.ingredientId !== ingredientId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !category || servings <= 0 || sellingPrice <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    createRecipeMutation.mutate({
      name,
      category,
      servings,
      prepTime,
      cookTime,
      sellingPrice,
      description: description || undefined,
      ingredients: selectedIngredients,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Add New Recipe
              </h1>
              <p className="text-slate-600">
                Create a new recipe and assign ingredients
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/recipes-view">← Back to Recipes</Link>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the recipe details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Recipe Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., California Roll"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Rolls, Nigiri, Sashimi"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the recipe"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings *</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      min="0"
                      value={prepTime || ""}
                      onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time (min)</Label>
                    <Input
                      id="cookTime"
                      type="number"
                      min="0"
                      value={cookTime || ""}
                      onChange={(e) => setCookTime(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price ($) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>Add ingredients from your inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ingredient Selector */}
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient">Ingredient</Label>
                    <Select value={currentIngredientId} onValueChange={setCurrentIngredientId}>
                      <SelectTrigger id="ingredient">
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients?.map((ing) => (
                          <SelectItem key={ing.id} value={ing.id.toString()}>
                            {ing.name} ({ing.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={currentUnit}
                      onChange={(e) => setCurrentUnit(e.target.value)}
                      placeholder="lb, oz, each"
                    />
                  </div>
                  <Button type="button" onClick={handleAddIngredient}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Selected Ingredients List */}
                {selectedIngredients.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Selected Ingredients ({selectedIngredients.length})</Label>
                    <div className="border rounded-lg divide-y">
                      {selectedIngredients.map((item) => {
                        const ingredient = ingredients?.find(i => i.id === item.ingredientId);
                        return (
                          <div key={item.ingredientId} className="flex items-center justify-between p-3">
                            <div className="flex-1">
                              <div className="font-medium">{ingredient?.name}</div>
                              <div className="text-sm text-slate-600">
                                {item.quantity} {item.unit}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveIngredient(item.ingredientId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/recipes-view">Cancel</Link>
              </Button>
              <Button type="submit" disabled={createRecipeMutation.isPending}>
                {createRecipeMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Create Recipe
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
