import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecipeEditModalProps {
  recipe: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeEditModal({ recipe, open, onOpenChange }: RecipeEditModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  
  // Fetch available ingredients
  const { data: availableIngredients } = trpc.ingredients.list.useQuery();
  
  // Form state
  const [name, setName] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description || "");
  const [category, setCategory] = useState(recipe.category || "");
  const [servings, setServings] = useState(recipe.servings || 1);
  const [sellingPrice, setSellingPrice] = useState(parseFloat(recipe.sellingPrice || "0"));
  const [ingredients, setIngredients] = useState<Array<{
    ingredientId: number;
    ingredientName: string;
    quantity: number;
    unit: string;
  }>>(recipe.ingredients.map((ing: any) => ({
    ingredientId: ing.ingredientId,
    ingredientName: ing.ingredientName,
    quantity: parseFloat(ing.quantity),
    unit: ing.unit,
  })));

  // Reset form when recipe changes
  useEffect(() => {
    setName(recipe.name);
    setDescription(recipe.description || "");
    setCategory(recipe.category || "");
    setServings(recipe.servings || 1);
    setSellingPrice(parseFloat(recipe.sellingPrice || "0"));
    setIngredients(recipe.ingredients.map((ing: any) => ({
      ingredientId: ing.ingredientId,
      ingredientName: ing.ingredientName,
      quantity: parseFloat(ing.quantity),
      unit: ing.unit,
    })));
  }, [recipe]);

  // Update mutation
  const updateMutation = trpc.recipes.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Recipe updated",
        description: "Your changes have been saved successfully.",
      });
      utils.recipes.list.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update recipe",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate({
      recipeId: recipe.id,
      name,
      description,
      category,
      servings,
      sellingPrice,
      ingredients: ingredients.map(ing => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    });
  };

  const addIngredient = () => {
    if (!availableIngredients || availableIngredients.length === 0) return;
    
    const firstIngredient = availableIngredients[0];
    setIngredients([...ingredients, {
      ingredientId: firstIngredient.id,
      ingredientName: firstIngredient.name,
      quantity: 1,
      unit: "pieces",
    }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    if (field === "ingredientId") {
      const ingredient = availableIngredients?.find(ing => ing.id === value);
      if (ingredient) {
        updated[index] = {
          ...updated[index],
          ingredientId: value,
          ingredientName: ingredient.name,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setIngredients(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
          <DialogDescription>
            Update recipe details, ingredients, and pricing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Selling Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                disabled={!availableIngredients || availableIngredients.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>

            {ingredients.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No ingredients added yet. Click "Add Ingredient" to get started.
              </p>
            )}

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 grid gap-2">
                    <Label className="text-xs">Ingredient</Label>
                    <Select
                      value={ingredient.ingredientId.toString()}
                      onValueChange={(value) => updateIngredient(index, "ingredientId", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIngredients?.map((ing) => (
                          <SelectItem key={ing.id} value={ing.id.toString()}>
                            {ing.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24 grid gap-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="w-28 grid gap-2">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
