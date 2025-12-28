import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UnitConversionsManager() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Queries
  const { data: conversions = [], isLoading } = trpc.ingredientConversions.list.useQuery();
  const { data: ingredients = [] } = trpc.ingredients.list.useQuery();
  const { data: units = [] } = trpc.ingredientUnits.listActive.useQuery();

  // Mutations
  const createMutation = trpc.ingredientConversions.create.useMutation({
    onSuccess: () => {
      utils.ingredientConversions.list.invalidate();
      toast({ title: "Conversion created successfully" });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error creating conversion", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.ingredientConversions.update.useMutation({
    onSuccess: () => {
      utils.ingredientConversions.list.invalidate();
      toast({ title: "Conversion updated successfully" });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error updating conversion", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.ingredientConversions.delete.useMutation({
    onSuccess: () => {
      utils.ingredientConversions.list.invalidate();
      toast({ title: "Conversion deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting conversion", description: error.message, variant: "destructive" });
    },
  });

  // Form state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ingredientId, setIngredientId] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [conversionFactor, setConversionFactor] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setIngredientId("");
    setFromUnit("");
    setToUnit("");
    setConversionFactor("");
    setNotes("");
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!ingredientId || !fromUnit || !toUnit || !conversionFactor) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      ingredientId: parseInt(ingredientId),
      fromUnit,
      toUnit,
      conversionFactor,
      notes: notes || undefined,
    });
  };

  const handleEdit = (conversion: any) => {
    setEditingId(conversion.id);
    setIngredientId(conversion.ingredientId.toString());
    setFromUnit(conversion.fromUnit);
    setToUnit(conversion.toUnit);
    setConversionFactor(conversion.conversionFactor);
    setNotes(conversion.notes || "");
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !fromUnit || !toUnit || !conversionFactor) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    updateMutation.mutate({
      id: editingId,
      fromUnit,
      toUnit,
      conversionFactor,
      notes: notes || undefined,
    });
  };

  const handleDelete = (id: number, ingredientName: string, fromUnit: string, toUnit: string) => {
    if (confirm(`Delete conversion for ${ingredientName}: 1 ${fromUnit} = ${toUnit}?`)) {
      deleteMutation.mutate({ id });
    }
  };

  // Group conversions by ingredient
  const conversionsByIngredient = conversions.reduce((acc: any, conv: any) => {
    const ingredient = ingredients.find((i: any) => i.id === conv.ingredientId);
    const ingredientName = ingredient?.name || `Ingredient #${conv.ingredientId}`;
    
    if (!acc[ingredientName]) {
      acc[ingredientName] = [];
    }
    acc[ingredientName].push(conv);
    return acc;
  }, {});

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading conversions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Unit Conversions</h3>
          <p className="text-sm text-muted-foreground">
            Define how custom units convert to standard measurements for accurate recipe costing
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Conversion
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p><strong>Standard units auto-convert:</strong> lb, oz, kg, g, gal, cup, tbsp, tsp, ml, l, dozen, each</p>
            <p><strong>Custom units need manual setup:</strong> pieces, roll, sheet, and any custom units you create</p>
            <p><strong>Example:</strong> If salmon costs $20/piece and a recipe uses 6 oz, define "1 piece = 8 oz" to calculate: 6 oz ÷ 8 oz/piece = 0.75 pieces × $20 = $15</p>
          </div>
        </CardContent>
      </Card>

      {/* Conversions List */}
      {Object.keys(conversionsByIngredient).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No conversions defined yet.</p>
            <p className="text-sm mt-2">Click "Add Conversion" to create your first unit conversion.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Object.entries(conversionsByIngredient).map(([ingredientName, convs]: [string, any]) => (
            <Card key={ingredientName}>
              <CardHeader>
                <CardTitle className="text-base">{ingredientName}</CardTitle>
                <CardDescription>{convs.length} conversion{convs.length > 1 ? "s" : ""} defined</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {convs.map((conv: any) => (
                    <div key={conv.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <span className="font-semibold">1 {conv.fromUnit}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{conv.conversionFactor} {conv.toUnit}</span>
                        </div>
                        {conv.notes && (
                          <span className="text-xs text-muted-foreground">({conv.notes})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(conv)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(conv.id, ingredientName, conv.fromUnit, conv.toUnit)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Unit Conversion</DialogTitle>
            <DialogDescription>
              Define how a custom unit converts to a standard measurement for this ingredient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ingredient">Ingredient *</Label>
              <Select value={ingredientId} onValueChange={setIngredientId}>
                <SelectTrigger id="ingredient">
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ing: any) => (
                    <SelectItem key={ing.id} value={ing.id.toString()}>
                      {ing.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromUnit">From Unit *</Label>
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger id="fromUnit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit: any) => (
                      <SelectItem key={unit.id} value={unit.name}>
                        {unit.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Usually custom unit (piece, roll)</p>
              </div>
              <div>
                <Label htmlFor="toUnit">To Unit *</Label>
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger id="toUnit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit: any) => (
                      <SelectItem key={unit.id} value={unit.name}>
                        {unit.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Usually standard unit (oz, lb)</p>
              </div>
            </div>
            <div>
              <Label htmlFor="factor">Conversion Factor *</Label>
              <Input
                id="factor"
                type="number"
                step="0.001"
                placeholder="e.g., 6 (means 1 piece = 6 oz)"
                value={conversionFactor}
                onChange={(e) => setConversionFactor(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How many {toUnit || "to-units"} equal 1 {fromUnit || "from-unit"}
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="e.g., Based on 6oz portions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Conversion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Unit Conversion</DialogTitle>
            <DialogDescription>
              Update the conversion factor or notes for this ingredient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ingredient</Label>
              <Input
                value={ingredients.find((i: any) => i.id === parseInt(ingredientId))?.name || ""}
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFromUnit">From Unit *</Label>
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger id="editFromUnit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit: any) => (
                      <SelectItem key={unit.id} value={unit.name}>
                        {unit.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editToUnit">To Unit *</Label>
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger id="editToUnit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit: any) => (
                      <SelectItem key={unit.id} value={unit.name}>
                        {unit.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editFactor">Conversion Factor *</Label>
              <Input
                id="editFactor"
                type="number"
                step="0.001"
                value={conversionFactor}
                onChange={(e) => setConversionFactor(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="editNotes">Notes (optional)</Label>
              <Textarea
                id="editNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Conversion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
