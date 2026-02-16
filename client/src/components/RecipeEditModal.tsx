import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { QuickAddCategoryButton } from "@/components/QuickAddCategoryButton";
import { UnitAccordionPicker } from "@/components/UnitAccordionPicker";

interface RecipeEditModalProps {
  recipe: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeEditModal({ recipe, open, onOpenChange }: RecipeEditModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  
  // Fetch available ingredients, categories, and units
  const { data: availableIngredients } = trpc.ingredients.list.useQuery();
  const { data: activeRecipeCategories = [] } = trpc.recipeCategories.listActive.useQuery({ categoryType: 'recipe' });
  const { data: activeUnits = [] } = trpc.ingredientUnits.listActive.useQuery();
  
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
    convertedCost?: string; // Backend-calculated cost with conversions
    isCalculating?: boolean; // Loading state for cost calculation
    hasConversionError?: boolean; // Flag for conversion errors
  }>>(recipe.ingredients.map((ing: any) => ({
    ingredientId: ing.ingredientId,
    ingredientName: ing.ingredientName,
    quantity: parseFloat(ing.quantity),
    unit: ing.unit,
    convertedCost: ing.convertedCost, // Preserve backend-calculated cost
    hasConversionError: !!ing.conversionWarning, // Set error flag if backend returned warning
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
      convertedCost: ing.convertedCost, // Preserve backend-calculated cost
      hasConversionError: !!ing.conversionWarning, // Set error flag if backend returned warning
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
          isCalculating: true, // Mark as calculating
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value, isCalculating: true };
    }
    setIngredients(updated);
  };

  // Real-time cost calculation with debouncing
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    ingredients.forEach((ingredient, index) => {
      if (ingredient.isCalculating && ingredient.ingredientId && ingredient.quantity > 0 && ingredient.unit) {
        // Debounce cost calculation (500ms after last change)
        const timer = setTimeout(async () => {
          try {
            const result = await utils.client.recipes.calculateIngredientCost.query({
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            });
            
            // Update cost in state
            setIngredients(prev => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                convertedCost: result.cost || undefined,
                isCalculating: false,
                hasConversionError: false, // Clear error flag on successful conversion
              };
              return updated;
            });
          } catch (error) {
            console.error("Failed to calculate ingredient cost:", error);
            setIngredients(prev => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                isCalculating: false,
                hasConversionError: true, // Mark as having conversion error
              };
              return updated;
            });
          }
        }, 500);
        
        timers.push(timer);
      }
    });
    
    // Cleanup timers on unmount or when dependencies change
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [ingredients, utils]);

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
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeRecipeCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <QuickAddCategoryButton categoryType="recipe" onCategoryAdded={(name) => setCategory(name)} />
                </div>
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
              {ingredients.map((ingredient, index) => {
                // Use backend-calculated cost if available, otherwise calculate estimate
                const ingredientData = availableIngredients?.find(ing => ing.id === ingredient.ingredientId);
                let ingredientCost = 0;
                
                // If we have the backend-calculated cost from initial load, use it
                if (ingredient.convertedCost) {
                  ingredientCost = parseFloat(ingredient.convertedCost);
                } else if (ingredientData?.costPerUnit) {
                  // Fallback: simple calculation (may not be accurate without conversions)
                  ingredientCost = ingredient.quantity * parseFloat(ingredientData.costPerUnit);
                }

                // Get the selected ingredient's unit for smart disabling
                const selectedIngredientUnit = ingredientData?.unit;
                
                // Determine which units to disable based on ingredient's unit category
                const disabledUnits = new Set<string>();
                let disabledReason = "";
                if (selectedIngredientUnit) {
                  const ingredientUnitData = activeUnits.find(u => u.name === selectedIngredientUnit);
                  const ingredientCategoryId = ingredientUnitData?.categoryId;
                  
                  // Disable all units from different categories
                  if (ingredientCategoryId) {
                    activeUnits.forEach(unit => {
                      if (unit.categoryId !== ingredientCategoryId) {
                        disabledUnits.add(unit.name);
                      }
                    });
                    
                    // Determine category name for tooltip
                    const categoryName = ingredientUnitData?.categoryId === 1 ? "Weight" : 
                                        ingredientUnitData?.categoryId === 2 ? "Volume" : 
                                        ingredientUnitData?.categoryId === 3 ? "Piece-Based" : "this category";
                    disabledReason = `This unit is incompatible with the ingredient's ${categoryName} unit type`;
                  }
                }

                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-[1fr_0.8fr_0.8fr_auto] gap-2 items-end">
                      <div className="grid gap-2 min-w-0 overflow-hidden">
                        <Label className="text-xs">Ingredient</Label>
                        <Select
                          value={ingredient.ingredientId.toString()}
                          onValueChange={(value) => updateIngredient(index, "ingredientId", parseInt(value))}
                        >
                          <SelectTrigger className="truncate max-w-full">
                            <SelectValue className="truncate" />
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

                      <div className="grid gap-2">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value))}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-xs">Cost</Label>
                        <div className="h-10 px-3 flex items-center justify-between text-sm text-muted-foreground bg-muted rounded-md">
                          <span>
                            {ingredient.isCalculating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              `$${ingredientCost.toFixed(2)}`
                            )}
                          </span>
                          {ingredient.hasConversionError && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Missing unit conversion - cost may be inaccurate</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <UnitAccordionPicker
                        units={activeUnits.map(u => ({ unit: u.name, unitDisplayName: u.displayName }))}
                        selectedUnit={ingredient.unit}
                        onSelectUnit={(value) => updateIngredient(index, "unit", value)}
                        label="Unit"
                        disabledUnits={disabledUnits}
                        disabledReason={disabledReason}
                      />
                    </div>
                  </div>
                );
              })}
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
