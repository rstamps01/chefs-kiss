import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { QuickAddUnitDialog } from "@/components/QuickAddUnitDialog";
import { QuickAddCategoryDialog } from "@/components/QuickAddCategoryDialog";

interface IngredientCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IngredientCreateModal({ open, onOpenChange }: IngredientCreateModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [supplier, setSupplier] = useState("");

  // Fetch active units and categories
  const { data: activeUnits = [] } = trpc.ingredientUnits.listActive.useQuery();
  const { data: activeCategories = [] } = trpc.recipeCategories.listActive.useQuery();

  const createMutation = trpc.ingredients.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ingredient created successfully",
      });
      utils.ingredients.list.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setCategory("");
    setUnit("");
    setCostPerUnit("");
    setSupplier("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Ingredient name is required",
        variant: "destructive",
      });
      return;
    }

    if (!unit.trim()) {
      toast({
        title: "Validation Error",
        description: "Unit type is required",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      category: category.trim() || undefined,
      unit: unit.trim(),
      costPerUnit: costPerUnit ? parseFloat(costPerUnit) : undefined,
      supplier: supplier.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Ingredient</DialogTitle>
          <DialogDescription>
            Add a new ingredient to your inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ingredient Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Fresh Salmon"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <QuickAddCategoryDialog onCategoryAdded={(name) => setCategory(name)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit Type *</Label>
            <div className="flex gap-2">
              <Select value={unit} onValueChange={setUnit} required>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  {activeUnits.map((u) => (
                    <SelectItem key={u.id} value={u.name}>
                      {u.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <QuickAddUnitDialog onUnitAdded={(name) => setUnit(name)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPerUnit">Cost Per Unit ($)</Label>
            <Input
              id="costPerUnit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              placeholder="e.g., Ocean Fresh Seafood Co."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Ingredient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
