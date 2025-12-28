import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface RecipeCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface IngredientInput {
  ingredientId: number;
  quantity: string;
  unit: string;
}

export function RecipeCreateModal({ open, onOpenChange, onSuccess }: RecipeCreateModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [servings, setServings] = useState("1");
  const [sellingPrice, setSellingPrice] = useState("");
  const [ingredientInputs, setIngredientInputs] = useState<IngredientInput[]>([
    { ingredientId: 0, quantity: "", unit: "" },
  ]);

  // Fetch available ingredients
  const { data: availableIngredients = [] } = trpc.ingredients.list.useQuery();

  // Create mutation
  const createMutation = trpc.recipes.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipe created successfully",
      });
      utils.recipes.list.invalidate();
      resetForm();
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create recipe",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setServings("1");
    setSellingPrice("");
    setIngredientInputs([{ ingredientId: 0, quantity: "", unit: "" }]);
  };

  const addIngredientRow = () => {
    setIngredientInputs([...ingredientInputs, { ingredientId: 0, quantity: "", unit: "" }]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredientInputs(ingredientInputs.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientInput, value: string | number) => {
    const updated = [...ingredientInputs];
    updated[index] = { ...updated[index], [field]: value };
    setIngredientInputs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Recipe name is required",
        variant: "destructive",
      });
      return;
    }

    if (!category.trim()) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    const servingsNum = parseInt(servings);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      toast({
        title: "Validation Error",
        description: "Servings must be a positive number",
        variant: "destructive",
      });
      return;
    }

    const priceNum = parseFloat(sellingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Validation Error",
        description: "Selling price must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Filter and validate ingredients
    const validIngredients = ingredientInputs
      .filter((ing) => ing.ingredientId > 0 && ing.quantity && ing.unit)
      .map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: parseFloat(ing.quantity),
        unit: ing.unit,
      }));

    if (validIngredients.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    // Submit
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim(),
      servings: servingsNum,
      sellingPrice: priceNum,
      ingredients: validIngredients,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Recipe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipe Name */}
          <div>
            <Label htmlFor="name">Recipe Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spicy Tuna Roll"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the recipe..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Sushi Rolls, Nigiri, Specialty"
              required
            />
          </div>

          {/* Servings and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="servings">Servings *</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Selling Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Ingredients *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredientRow}>
                <Plus className="h-4 w-4 mr-1" />
                Add Ingredient
              </Button>
            </div>

            <div className="space-y-3">
              {ingredientInputs.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Ingredient</Label>
                    <Select
                      value={ingredient.ingredientId.toString()}
                      onValueChange={(value) => updateIngredient(index, "ingredientId", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIngredients.map((ing) => (
                          <SelectItem key={ing.id} value={ing.id.toString()}>
                            {ing.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="w-28">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                      placeholder="pieces, oz"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredientRow(index)}
                    disabled={ingredientInputs.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Recipe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
