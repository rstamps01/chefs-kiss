import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Save, X, ArrowUpDown, Trash2, Download, Upload, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ColumnVisibilityControl } from "./ColumnVisibilityControl";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import { CSVImportModal } from "./CSVImportModal";
import { useToast } from "@/hooks/use-toast";

type Recipe = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  sellingPrice: string | null;
  ingredientsCount?: number;
  totalCost?: number;
  foodCostPercent?: number;
  marginPercent?: number;
};

type RecipesTableViewProps = {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: number, name: string) => void;
  categories: string[];
};

const DEFAULT_RECIPE_COLUMNS = [
  { id: "id", label: "ID", visible: true },
  { id: "name", label: "Name", visible: true },
  { id: "category", label: "Category", visible: true },
  { id: "description", label: "Description", visible: true },
  { id: "servings", label: "Servings", visible: true },
  { id: "prepTime", label: "Prep Time (min)", visible: true },
  { id: "cookTime", label: "Cook Time (min)", visible: true },
  { id: "price", label: "Price", visible: true },
  { id: "totalCost", label: "Total Cost ($)", visible: false },
  { id: "foodCost", label: "Food Cost %", visible: true },
  { id: "margin", label: "Margin %", visible: true },
  { id: "ingredients", label: "Ingredients Count", visible: true },
  { id: "actions", label: "Actions", visible: true },
];

type SortColumn = "name" | "category" | "servings" | "price" | "foodCost" | "margin";
type SortDirection = "asc" | "desc";

export function RecipesTableView({ recipes, onEdit, onDelete, categories }: RecipesTableViewProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Recipe>>({});
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<"recipes" | "recipeIngredients">("recipes");
  
  const { toast } = useToast();

  const { columns, toggleColumn, resetToDefault, isColumnVisible } = useColumnVisibility(
    "recipes-table-columns",
    DEFAULT_RECIPE_COLUMNS
  );

  const utils = trpc.useUtils();
  const exportRecipesQuery = trpc.csv.exportRecipes.useQuery(
    { visibleColumns: columns.filter(c => c.visible).map(c => c.id) },
    { enabled: false }
  );
  const exportRecipeIngredientsQuery = trpc.csv.exportRecipeIngredients.useQuery(undefined, { enabled: false });
  const recipesTemplateQuery = trpc.csv.downloadRecipesTemplate.useQuery(undefined, { enabled: false });
  const recipeIngredientsTemplateQuery = trpc.csv.downloadRecipeIngredientsTemplate.useQuery(undefined, { enabled: false });
  const updateMutation = trpc.recipes.update.useMutation({
    onSuccess: () => {
      utils.recipes.list.invalidate();
      setEditingId(null);
      setEditedValues({});
    },
  });

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setEditedValues({
      name: recipe.name,
      category: recipe.category,
      description: recipe.description || "",
      servings: recipe.servings,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      sellingPrice: recipe.sellingPrice,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedValues({});
  };

  const handleSave = () => {
    if (editingId === null) return;

    updateMutation.mutate({
      recipeId: editingId,
      name: editedValues.name,
      category: editedValues.category || undefined,
      description: editedValues.description || undefined,
      servings: editedValues.servings ? parseInt(String(editedValues.servings)) : undefined,
      prepTime: editedValues.prepTime ? parseInt(String(editedValues.prepTime)) : undefined,
      cookTime: editedValues.cookTime ? parseInt(String(editedValues.cookTime)) : undefined,
      sellingPrice: editedValues.sellingPrice ? parseFloat(editedValues.sellingPrice) : undefined,
    });
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedRecipes = [...recipes].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortColumn) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "category":
        aVal = (a.category || "").toLowerCase();
        bVal = (b.category || "").toLowerCase();
        break;
      case "servings":
        aVal = a.servings || 0;
        bVal = b.servings || 0;
        break;
      case "price":
        aVal = parseFloat(a.sellingPrice || "0");
        bVal = parseFloat(b.sellingPrice || "0");
        break;
      case "foodCost":
        aVal = a.foodCostPercent || 0;
        bVal = b.foodCostPercent || 0;
        break;
      case "margin":
        aVal = a.marginPercent || 0;
        bVal = b.marginPercent || 0;
        break;
    }

    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  const handleDownloadRecipesTemplate = async () => {
    try {
      const result = await recipesTemplateQuery.refetch();
      if (result.data?.csv) {
        const blob = new Blob([result.data.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recipes-import-template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Template downloaded",
          description: "Recipes import template with instructions has been downloaded.",
        });
      }
    } catch (error) {
      console.error('Template download failed:', error);
      toast({
        title: "Download failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadRecipeIngredientsTemplate = async () => {
    try {
      const result = await recipeIngredientsTemplateQuery.refetch();
      if (result.data?.csv) {
        const blob = new Blob([result.data.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recipe-ingredients-import-template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Template downloaded",
          description: "Recipe ingredients import template with instructions has been downloaded.",
        });
      }
    } catch (error) {
      console.error('Template download failed:', error);
      toast({
        title: "Download failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportRecipes = async () => {
    const visibleColumns = columns.filter(c => c.visible).map(c => c.id);
    const result = await exportRecipesQuery.refetch();
    
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recipes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `Exported ${recipes.length} recipes to CSV`,
      });
    }
  };

  const handleExportRecipeIngredients = async () => {
    const result = await exportRecipeIngredientsQuery.refetch();
    
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recipe-ingredients-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Exported all recipe ingredients to CSV for bulk editing",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Edit Workflow Guidance */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Bulk Edit Workflow</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Export Data</strong> → Edit in Excel/Google Sheets → <strong>Import CSV</strong> to update. 
              The system automatically detects changes and shows a preview before applying updates.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleDownloadRecipesTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Recipes Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadRecipeIngredientsTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Ingredients Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportRecipes}>
            <Download className="h-4 w-4 mr-2" />
            Export Recipes
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportRecipeIngredients}>
            <Download className="h-4 w-4 mr-2" />
            Export Ingredients
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setImportType("recipes"); setImportModalOpen(true); }}>
            <Upload className="h-4 w-4 mr-2" />
            Import Recipes
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setImportType("recipeIngredients"); setImportModalOpen(true); }}>
            <Upload className="h-4 w-4 mr-2" />
            Import Ingredients
          </Button>
        </div>
        <ColumnVisibilityControl
          columns={columns}
          onToggleColumn={toggleColumn}
          onResetToDefault={resetToDefault}
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {isColumnVisible("id") && (
            <TableHead className="text-right">ID</TableHead>
            )}
            {isColumnVisible("name") && (
            <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
              <div className="flex items-center gap-1">
                Name
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            )}
            {isColumnVisible("category") && (
            <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
              <div className="flex items-center gap-1">
                Category
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            )}
            {isColumnVisible("description") && (
            <TableHead>Description</TableHead>
            )}
            {isColumnVisible("servings") && (
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("servings")}>
              <div className="flex items-center justify-end gap-1">
                Servings
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            )}
            {isColumnVisible("prepTime") && (
            <TableHead className="text-right">Prep (min)</TableHead>
            )}
            {isColumnVisible("cookTime") && (
            <TableHead className="text-right">Cook (min)</TableHead>
            )}
            {isColumnVisible("price") && (
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("price")}>
              <div className="flex items-center justify-end gap-1">
                Price
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            )}
            {isColumnVisible("totalCost") && (
            <TableHead className="text-right">Total Cost</TableHead>
            )}
            {isColumnVisible("foodCost") && (
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("foodCost")}>
              <div className="flex items-center justify-end gap-1">
                Food Cost %
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            )}
            {isColumnVisible("margin") && (
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("margin")}>
              <div className="flex items-center justify-end gap-1">
                Margin %
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            )}
            {isColumnVisible("ingredients") && (
            <TableHead className="text-right">Ingredients</TableHead>
            )}
            {isColumnVisible("actions") && (
            <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecipes.map((recipe) => {
            const isEditing = editingId === recipe.id;

            return (
              <TableRow key={recipe.id}>
                {isColumnVisible("id") && (
                <TableCell className="text-right">
                  {recipe.id}
                </TableCell>
                )}
                {isColumnVisible("name") && (
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editedValues.name || ""}
                      onChange={(e) => setEditedValues({ ...editedValues, name: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    recipe.name
                  )}
                </TableCell>
                )}
                {isColumnVisible("category") && (
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={editedValues.category || ""}
                      onValueChange={(value) => setEditedValues({ ...editedValues, category: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...categories].sort((a, b) => a.localeCompare(b)).map((cat, index) => (
                          <SelectItem key={`recipe-table-cat-${index}-${cat}`} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    recipe.category || "-"
                  )}
                </TableCell>
                )}
                {isColumnVisible("description") && (
                <TableCell className="max-w-xs truncate">
                  {isEditing ? (
                    <Input
                      value={editedValues.description || ""}
                      onChange={(e) => setEditedValues({ ...editedValues, description: e.target.value })}
                      className="h-8"
                      placeholder="Description"
                    />
                  ) : (
                    recipe.description || "-"
                  )}
                </TableCell>
                )}
                {isColumnVisible("servings") && (
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedValues.servings || ""}
                      onChange={(e) => setEditedValues({ ...editedValues, servings: parseInt(e.target.value) || null })}
                      className="h-8 w-20"
                      min="1"
                    />
                  ) : (
                    recipe.servings || "-"
                  )}
                </TableCell>
                )}
                {isColumnVisible("prepTime") && (
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedValues.prepTime || ""}
                      onChange={(e) => setEditedValues({ ...editedValues, prepTime: parseInt(e.target.value) || null })}
                      className="h-8 w-20"
                      min="0"
                    />
                  ) : (
                    recipe.prepTime || "-"
                  )}
                </TableCell>
                )}
                {isColumnVisible("cookTime") && (
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedValues.cookTime || ""}
                      onChange={(e) => setEditedValues({ ...editedValues, cookTime: parseInt(e.target.value) || null })}
                      className="h-8 w-20"
                      min="0"
                    />
                  ) : (
                    recipe.cookTime || "-"
                  )}
                </TableCell>
                )}
                {isColumnVisible("price") && (
                <TableCell className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedValues.sellingPrice || ""}
                      onChange={(e) => setEditedValues({ ...editedValues, sellingPrice: e.target.value })}
                      className="h-8 w-24"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    recipe.sellingPrice ? `$${parseFloat(recipe.sellingPrice).toFixed(2)}` : "-"
                  )}
                </TableCell>
                )}
                {isColumnVisible("totalCost") && (
                <TableCell className="text-right">
                  {recipe.totalCost !== undefined ? `$${recipe.totalCost.toFixed(2)}` : "-"}
                </TableCell>
                )}
                {isColumnVisible("foodCost") && (
                <TableCell className="text-right">
                  {recipe.foodCostPercent !== undefined ? `${recipe.foodCostPercent.toFixed(1)}%` : "-"}
                </TableCell>
                )}
                {isColumnVisible("margin") && (
                <TableCell className="text-right">
                  {recipe.marginPercent !== undefined ? `${recipe.marginPercent.toFixed(1)}%` : "-"}
                </TableCell>
                )}
                {isColumnVisible("ingredients") && (
                <TableCell className="text-right">
                  {recipe.ingredientsCount || 0}
                </TableCell>
                )}
                {isColumnVisible("actions") && (
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(recipe)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(recipe.id, recipe.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
      
      <CSVImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        type={importType}
        onSuccess={() => {
          toast({
            title: "Import successful",
            description: importType === "recipes" ? "Recipes have been updated from CSV" : "Recipe ingredients have been updated from CSV",
          });
        }}
      />
    </div>
  );
}
