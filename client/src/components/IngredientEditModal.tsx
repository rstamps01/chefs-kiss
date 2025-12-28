import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Ingredient {
  id: number;
  name: string;
  category: string | null;
  unit: string;
  costPerUnit: string | null;
  supplier: string | null;
}

interface IngredientEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient: Ingredient | null;
}

export function IngredientEditModal({ open, onOpenChange, ingredient }: IngredientEditModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [supplier, setSupplier] = useState("");

  // Fetch active units
  const { data: activeUnits = [] } = trpc.ingredientUnits.listActive.useQuery();

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setCategory(ingredient.category || "");
      setUnit(ingredient.unit);
      setCostPerUnit(ingredient.costPerUnit || "");
      setSupplier(ingredient.supplier || "");
    }
  }, [ingredient]);

  const updateMutation = trpc.ingredients.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ingredient updated successfully",
      });
      utils.ingredients.list.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ingredient) return;

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

    updateMutation.mutate({
      ingredientId: ingredient.id,
      name: name.trim(),
      category: category.trim() || undefined,
      unit: unit.trim(),
      costPerUnit: costPerUnit ? parseFloat(costPerUnit) : undefined,
      supplier: supplier.trim() || undefined,
    });
  };

  if (!ingredient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
          <DialogDescription>
            Update ingredient details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Ingredient Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Fresh Salmon"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Input
              id="edit-category"
              placeholder="e.g., Seafood, Vegetables, Sauces"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-unit">Unit Type *</Label>
            <Select value={unit} onValueChange={setUnit} required>
              <SelectTrigger id="edit-unit">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-costPerUnit">Cost Per Unit ($)</Label>
            <Input
              id="edit-costPerUnit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-supplier">Supplier</Label>
            <Input
              id="edit-supplier"
              placeholder="e.g., Ocean Fresh Seafood Co."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Ingredient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
