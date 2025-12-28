import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ChefHat } from "lucide-react";
import { Link } from "wouter";

/**
 * Simple view to display recipes and their ingredients from the database
 */
export default function RecipeIngredientsView() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: recipes, isLoading: recipesLoading } = trpc.recipes.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: restaurant } = trpc.restaurant.get.useQuery(undefined, {
    enabled: isAuthenticated,
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
              Please sign in to view your recipes and ingredients
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
  if (authLoading || recipesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Recipe & Ingredient Database
              </h1>
              {restaurant && (
                <p className="text-slate-600">
                  {restaurant.name} - Sample Data View
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/">← Back to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/recipes/add">+ Add Recipe</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Recipes with Ingredients */}
        {recipes && recipes.length > 0 ? (
          <div className="space-y-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{recipe.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {recipe.description || `${recipe.category} - ${recipe.servings} servings`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {recipe.sellingPrice && (
                        <div className="text-2xl font-bold text-green-600">
                          ${Number(recipe.sellingPrice).toFixed(2)}
                        </div>
                      )}
                      {recipe.costPerServing && (
                        <div className="text-sm text-slate-500">
                          Cost: ${Number(recipe.costPerServing).toFixed(2)}/serving
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-3">Ingredients:</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ingredient</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recipe.ingredients.map((ing, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">
                                {ing.ingredientName}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {ing.category}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {Number(ing.quantity).toFixed(2)}
                              </TableCell>
                              <TableCell>{ing.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No ingredients defined for this recipe</p>
                  )}
                  
                  {/* Recipe metadata */}
                  <div className="mt-4 pt-4 border-t flex gap-6 text-sm text-slate-600">
                    {recipe.prepTime && (
                      <div>
                        <span className="font-medium">Prep:</span> {recipe.prepTime} min
                      </div>
                    )}
                    {recipe.cookTime && (
                      <div>
                        <span className="font-medium">Cook:</span> {recipe.cookTime} min
                      </div>
                    )}
                    {recipe.servings && (
                      <div>
                        <span className="font-medium">Servings:</span> {recipe.servings}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-4">No recipes found in the database</p>
              <p className="text-sm text-slate-500">
                Run the seed script to populate sample data
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        {recipes && recipes.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Database Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{recipes.length}</div>
                  <div className="text-sm text-slate-600">Recipes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {recipes.reduce((sum, r) => sum + (r.ingredients?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-slate-600">Recipe-Ingredient Links</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {new Set(recipes.flatMap(r => r.ingredients?.map(i => i.ingredientId) || [])).size}
                  </div>
                  <div className="text-sm text-slate-600">Unique Ingredients</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
