import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function BulkDelete() {
  const { toast } = useToast();
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set());
  const [selectedRecipes, setSelectedRecipes] = useState<Set<number>>(new Set());
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);

  // Fetch data
  const { data: ingredients = [], refetch: refetchIngredients } = trpc.ingredients.list.useQuery();
  const { data: recipes = [], refetch: refetchRecipes } = trpc.recipes.list.useQuery();

  // Mutations
  const bulkDeleteIngredientsMutation = trpc.developer.bulkDeleteIngredients.useMutation({
    onSuccess: (result) => {
      toast({
        title: "Bulk Delete Complete",
        description: `Deleted: ${result.deleted}, Failed: ${result.failed}, Skipped: ${result.skipped.length}`,
      });
      setSelectedIngredients(new Set());
      refetchIngredients();
      setShowIngredientDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Bulk Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkDeleteRecipesMutation = trpc.developer.bulkDeleteRecipes.useMutation({
    onSuccess: (result) => {
      toast({
        title: "Bulk Delete Complete",
        description: `Deleted: ${result.deleted} recipes and ${result.recipeIngredientsDeleted} recipe ingredients, Failed: ${result.failed}, Skipped: ${result.skipped.length}`,
      });
      setSelectedRecipes(new Set());
      refetchRecipes();
      setShowRecipeDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Bulk Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ingredient selection handlers
  const toggleIngredient = (id: number) => {
    const newSelection = new Set(selectedIngredients);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIngredients(newSelection);
  };

  const selectAllIngredients = () => {
    setSelectedIngredients(new Set(ingredients.map(i => i.id)));
  };

  const clearIngredientSelection = () => {
    setSelectedIngredients(new Set());
  };

  // Recipe selection handlers
  const toggleRecipe = (id: number) => {
    const newSelection = new Set(selectedRecipes);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRecipes(newSelection);
  };

  const selectAllRecipes = () => {
    setSelectedRecipes(new Set(recipes.map(r => r.id)));
  };

  const clearRecipeSelection = () => {
    setSelectedRecipes(new Set());
  };

  // Delete handlers
  const handleDeleteIngredients = () => {
    bulkDeleteIngredientsMutation.mutate({
      ingredientIds: Array.from(selectedIngredients),
    });
  };

  const handleDeleteRecipes = () => {
    bulkDeleteRecipesMutation.mutate({
      recipeIds: Array.from(selectedRecipes),
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Delete Operations</h1>
        <p className="text-muted-foreground">
          Developer/Support tool for bulk deletion of ingredients and recipes
        </p>
      </div>

      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> Bulk delete operations are permanent and cannot be undone.
          Use with extreme caution. This feature is restricted to developer access only.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Delete Ingredients</CardTitle>
              <CardDescription>
                Select ingredients to delete. Ingredients used in recipes cannot be deleted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllIngredients}
                  disabled={ingredients.length === 0}
                >
                  Select All ({ingredients.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearIngredientSelection}
                  disabled={selectedIngredients.size === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowIngredientDialog(true)}
                  disabled={selectedIngredients.size === 0}
                  className="ml-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedIngredients.size})
                </Button>
              </div>

              <div className="border rounded-lg max-h-[500px] overflow-y-auto">
                {ingredients.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No ingredients found
                  </div>
                ) : (
                  <div className="divide-y">
                    {ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleIngredient(ingredient.id)}
                      >
                        <Checkbox
                          checked={selectedIngredients.has(ingredient.id)}
                          onCheckedChange={() => toggleIngredient(ingredient.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{ingredient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {ingredient.category} • {ingredient.unit}
                            {ingredient.costPerUnit && ` • $${ingredient.costPerUnit}/${ingredient.unit}`}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {ingredient.id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Delete Recipes</CardTitle>
              <CardDescription>
                Select recipes to delete. Recipe ingredients will be automatically deleted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllRecipes}
                  disabled={recipes.length === 0}
                >
                  Select All ({recipes.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearRecipeSelection}
                  disabled={selectedRecipes.size === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowRecipeDialog(true)}
                  disabled={selectedRecipes.size === 0}
                  className="ml-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedRecipes.size})
                </Button>
              </div>

              <div className="border rounded-lg max-h-[500px] overflow-y-auto">
                {recipes.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No recipes found
                  </div>
                ) : (
                  <div className="divide-y">
                    {recipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted-foreground cursor-pointer"
                        onClick={() => toggleRecipe(recipe.id)}
                      >
                        <Checkbox
                          checked={selectedRecipes.has(recipe.id)}
                          onCheckedChange={() => toggleRecipe(recipe.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{recipe.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {recipe.category} • {recipe.servings} servings
                            {recipe.ingredients && ` • ${recipe.ingredients.length} ingredients`}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {recipe.id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ingredient Delete Confirmation Dialog */}
      <AlertDialog open={showIngredientDialog} onOpenChange={setShowIngredientDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to delete <strong>{selectedIngredients.size} ingredient(s)</strong>.
              </p>
              <p className="text-destructive font-medium">
                This action cannot be undone. Ingredients used in recipes will be skipped.
              </p>
              <p>
                Are you sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIngredients}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedIngredients.size} Ingredient(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recipe Delete Confirmation Dialog */}
      <AlertDialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to delete <strong>{selectedRecipes.size} recipe(s)</strong>.
              </p>
              <p className="text-destructive font-medium">
                This action cannot be undone. All recipe ingredients will also be deleted.
              </p>
              <p>
                Are you sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRecipes}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedRecipes.size} Recipe(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
