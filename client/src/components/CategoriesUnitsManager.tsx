import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Tag, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CategoriesUnitsManager() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Recipe Categories State
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState("");

  // Ingredient Units State
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [unitName, setUnitName] = useState("");
  const [unitDisplayName, setUnitDisplayName] = useState("");

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = trpc.recipeCategories.list.useQuery();
  const { data: units = [], isLoading: unitsLoading } = trpc.ingredientUnits.list.useQuery();

  // Recipe Category Mutations
  const createCategoryMutation = trpc.recipeCategories.create.useMutation({
    onSuccess: () => {
      utils.recipeCategories.list.invalidate();
      utils.recipeCategories.listActive.invalidate();
      setCategoryDialogOpen(false);
      setCategoryName("");
      toast({ title: "Category created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating category", description: error.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = trpc.recipeCategories.update.useMutation({
    onSuccess: () => {
      utils.recipeCategories.list.invalidate();
      utils.recipeCategories.listActive.invalidate();
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      toast({ title: "Category updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating category", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = trpc.recipeCategories.delete.useMutation({
    onSuccess: () => {
      utils.recipeCategories.list.invalidate();
      utils.recipeCategories.listActive.invalidate();
      toast({ title: "Category deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    },
  });

  // Ingredient Unit Mutations
  const createUnitMutation = trpc.ingredientUnits.create.useMutation({
    onSuccess: () => {
      utils.ingredientUnits.list.invalidate();
      utils.ingredientUnits.listActive.invalidate();
      setUnitDialogOpen(false);
      setUnitName("");
      setUnitDisplayName("");
      toast({ title: "Unit created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating unit", description: error.message, variant: "destructive" });
    },
  });

  const updateUnitMutation = trpc.ingredientUnits.update.useMutation({
    onSuccess: () => {
      utils.ingredientUnits.list.invalidate();
      utils.ingredientUnits.listActive.invalidate();
      setUnitDialogOpen(false);
      setEditingUnit(null);
      setUnitName("");
      setUnitDisplayName("");
      toast({ title: "Unit updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating unit", description: error.message, variant: "destructive" });
    },
  });

  const deleteUnitMutation = trpc.ingredientUnits.delete.useMutation({
    onSuccess: () => {
      utils.ingredientUnits.list.invalidate();
      utils.ingredientUnits.listActive.invalidate();
      toast({ title: "Unit deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting unit", description: error.message, variant: "destructive" });
    },
  });

  // Handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        categoryId: editingCategory.id,
        name: categoryName,
      });
    } else {
      createCategoryMutation.mutate({
        name: categoryName,
      });
    }
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("Are you sure you want to delete this category? This will fail if the category is used in any recipes.")) {
      deleteCategoryMutation.mutate({ categoryId });
    }
  };

  const handleToggleCategoryActive = (categoryId: number, isActive: boolean) => {
    updateCategoryMutation.mutate({
      categoryId,
      isActive: !isActive,
    });
  };

  const handleCreateUnit = () => {
    setEditingUnit(null);
    setUnitName("");
    setUnitDisplayName("");
    setUnitDialogOpen(true);
  };

  const handleEditUnit = (unit: any) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
    setUnitDisplayName(unit.displayName);
    setUnitDialogOpen(true);
  };

  const handleSaveUnit = () => {
    if (!unitName.trim() || !unitDisplayName.trim()) {
      toast({ title: "Unit name and display name are required", variant: "destructive" });
      return;
    }

    if (editingUnit) {
      updateUnitMutation.mutate({
        unitId: editingUnit.id,
        name: unitName,
        displayName: unitDisplayName,
      });
    } else {
      createUnitMutation.mutate({
        name: unitName,
        displayName: unitDisplayName,
      });
    }
  };

  const handleDeleteUnit = (unitId: number) => {
    if (confirm("Are you sure you want to delete this unit? This will fail if the unit is used in any ingredients.")) {
      deleteUnitMutation.mutate({ unitId });
    }
  };

  const handleToggleUnitActive = (unitId: number, isActive: boolean) => {
    updateUnitMutation.mutate({
      unitId,
      isActive: !isActive,
    });
  };

  return (
    <>
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">
            <Tag className="mr-2 h-4 w-4" />
            Recipe Categories
          </TabsTrigger>
          <TabsTrigger value="units">
            <Ruler className="mr-2 h-4 w-4" />
            Ingredient Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Recipe Categories</h3>
              <p className="text-sm text-muted-foreground">
                Manage categories available when creating recipes
              </p>
            </div>
            <Button onClick={handleCreateCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          {categoriesLoading ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Loading categories...</p>
              </CardContent>
            </Card>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No categories yet. Click "Add Category" to create one.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor={`category-${category.id}`} className="text-sm">
                          Active
                        </Label>
                        <Switch
                          id={`category-${category.id}`}
                          checked={category.isActive}
                          onCheckedChange={() => handleToggleCategoryActive(category.id, category.isActive)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Ingredient Units</h3>
              <p className="text-sm text-muted-foreground">
                Manage units available when creating ingredients
              </p>
            </div>
            <Button onClick={handleCreateUnit}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </div>

          {unitsLoading ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Loading units...</p>
              </CardContent>
            </Card>
          ) : units.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No units yet. Click "Add Unit" to create one.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {units.map((unit) => (
                <Card key={unit.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Ruler className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{unit.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          Code: {unit.name} • {unit.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor={`unit-${unit.id}`} className="text-sm">
                          Active
                        </Label>
                        <Switch
                          id={`unit-${unit.id}`}
                          checked={unit.isActive}
                          onCheckedChange={() => handleToggleUnitActive(unit.id, unit.isActive)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUnit(unit)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category name"
                : "Add a new category for organizing recipes"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name *</Label>
              <Input
                id="category-name"
                placeholder="e.g., Sushi Rolls, Nigiri, Specialty"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "Update" : "Create"} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unit Dialog */}
      <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? "Edit Unit" : "Create Unit"}
            </DialogTitle>
            <DialogDescription>
              {editingUnit
                ? "Update the unit details"
                : "Add a new unit for measuring ingredients"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Unit Code *</Label>
              <Input
                id="unit-name"
                placeholder="e.g., lb, oz, kg, pieces"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Short code used in the database (lowercase, no spaces)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-display-name">Display Name *</Label>
              <Input
                id="unit-display-name"
                placeholder="e.g., Pounds (lb), Ounces (oz), Kilograms (kg)"
                value={unitDisplayName}
                onChange={(e) => setUnitDisplayName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Friendly name shown in dropdowns and forms
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUnit}>
              {editingUnit ? "Update" : "Create"} Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
