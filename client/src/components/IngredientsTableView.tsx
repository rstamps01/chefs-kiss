import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Check, X, ArrowUp, ArrowDown, Download, Upload, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ColumnVisibilityControl } from "./ColumnVisibilityControl";
import { useColumnVisibility } from "@/hooks/useColumnVisibility";
import { CSVImportModal } from "./CSVImportModal";
import { useToast } from "@/hooks/use-toast";

interface IngredientsTableViewProps {
  ingredients: any[];
  onEdit: (ingredient: any) => void;
  onDelete: (id: number, name: string) => void;
  activeUnits: any[];
  categories: string[];
}

const DEFAULT_INGREDIENT_COLUMNS = [
  { id: "name", label: "Name", visible: true },
  { id: "category", label: "Category", visible: true },
  { id: "unit", label: "Unit Type", visible: true },
  { id: "costPerUnit", label: "Cost Per Unit", visible: true },
  { id: "pieceWeightOz", label: "Piece Weight (oz)", visible: true },
  { id: "supplier", label: "Supplier", visible: true },
  { id: "shelfLife", label: "Shelf Life (days)", visible: false },
  { id: "minStock", label: "Min Stock", visible: false },
  { id: "actions", label: "Actions", visible: true },
];

type SortField = "name" | "category" | "unit" | "costPerUnit" | "supplier";
type SortDirection = "asc" | "desc";

export function IngredientsTableView({ 
  ingredients, 
  onEdit, 
  onDelete,
  activeUnits,
  categories
}: IngredientsTableViewProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<any>({});
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [importModalOpen, setImportModalOpen] = useState(false);
  
  const { toast } = useToast();
  
  const { columns, toggleColumn, resetToDefault, isColumnVisible } = useColumnVisibility(
    "ingredients-table-columns",
    DEFAULT_INGREDIENT_COLUMNS
  );

  const utils = trpc.useUtils();
  const exportQuery = trpc.csv.exportIngredients.useQuery(
    { visibleColumns: columns.filter(c => c.visible).map(c => c.id) },
    { enabled: false }
  );
  const templateQuery = trpc.csv.downloadIngredientsTemplate.useQuery(
    undefined,
    { enabled: false }
  );
  const updateMutation = trpc.ingredients.update.useMutation({
    onSuccess: () => {
      utils.ingredients.list.invalidate();
      setEditingId(null);
      setEditedValues({});
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    
    if (sortField === "costPerUnit") {
      const aNum = parseFloat(aVal) || 0;
      const bNum = parseFloat(bVal) || 0;
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }
    
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleStartEdit = (ingredient: any) => {
    setEditingId(ingredient.id);
    setEditedValues({
      name: ingredient.name,
      category: ingredient.category || "",
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit || "",
      pieceWeightOz: ingredient.pieceWeightOz || "",
      supplier: ingredient.supplier || "",
      shelfLife: ingredient.shelfLife || "",
      minStock: ingredient.minStock || "",
    });
  };

  const handleSave = () => {
    if (editingId === null) return;

    updateMutation.mutate({
      ingredientId: editingId,
      name: editedValues.name,
      category: editedValues.category || null,
      unit: editedValues.unit,
      costPerUnit: editedValues.costPerUnit ? parseFloat(editedValues.costPerUnit) : undefined,
      pieceWeightOz: editedValues.pieceWeightOz ? parseFloat(editedValues.pieceWeightOz) : undefined,
      supplier: editedValues.supplier || null,
      shelfLife: editedValues.shelfLife ? parseInt(editedValues.shelfLife) : undefined,
      minStock: editedValues.minStock ? parseFloat(editedValues.minStock) : undefined,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedValues({});
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? 
      <ArrowUp className="h-3 w-3 inline ml-1" /> : 
      <ArrowDown className="h-3 w-3 inline ml-1" />;
  };

  const handleDownloadTemplate = async () => {
    try {
      const result = await templateQuery.refetch();
      if (result.data?.csv) {
        const blob = new Blob([result.data.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ingredients-import-template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Template downloaded",
          description: "Import template with instructions has been downloaded. Fill it out and use Import CSV to upload.",
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

  const handleExport = async () => {
    const visibleColumns = columns.filter(c => c.visible).map(c => c.id);
    const result = await exportQuery.refetch();
    
    if (result.data?.csv) {
      // Create download link
      const blob = new Blob([result.data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ingredients-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `Exported ${ingredients.length} ingredients to CSV`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
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
            {isColumnVisible("name") && (
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
                Name <SortIcon field="name" />
              </TableHead>
            )}
            {isColumnVisible("category") && (
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("category")}>
                Category <SortIcon field="category" />
              </TableHead>
            )}
            {isColumnVisible("unit") && (
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("unit")}>
                Unit <SortIcon field="unit" />
              </TableHead>
            )}
            {isColumnVisible("costPerUnit") && (
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("costPerUnit")}>
                Cost/Unit <SortIcon field="costPerUnit" />
              </TableHead>
            )}
            {isColumnVisible("pieceWeightOz") && (
              <TableHead>Piece Weight (oz)</TableHead>
            )}
            {isColumnVisible("supplier") && (
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("supplier")}>
                Supplier <SortIcon field="supplier" />
              </TableHead>
            )}
            {isColumnVisible("shelfLife") && (
              <TableHead>Shelf Life (days)</TableHead>
            )}
            {isColumnVisible("minStock") && (
              <TableHead>Min Stock</TableHead>
            )}
            {isColumnVisible("actions") && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedIngredients.map((ingredient) => {
            const isEditing = editingId === ingredient.id;

            return (
              <TableRow key={ingredient.id}>
                {isColumnVisible("name") && (
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editedValues.name}
                      onChange={(e) => setEditedValues({ ...editedValues, name: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    ingredient.name
                  )}
                </TableCell>
                )}
                
                {isColumnVisible("category") && (
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={editedValues.category}
                      onValueChange={(value) => setEditedValues({ ...editedValues, category: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    ingredient.category || "-"
                  )}
                </TableCell>
                )}

                {isColumnVisible("unit") && (
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={editedValues.unit}
                      onValueChange={(value) => setEditedValues({ ...editedValues, unit: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {activeUnits.map((unit) => (
                          <SelectItem key={unit.name} value={unit.name}>
                            {unit.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    ingredient.unitDisplayName || ingredient.unit
                  )}
                </TableCell>
                )}

                {isColumnVisible("costPerUnit") && (
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editedValues.costPerUnit}
                      onChange={(e) => setEditedValues({ ...editedValues, costPerUnit: e.target.value })}
                      className="h-8"
                      placeholder="0.00"
                    />
                  ) : (
                    ingredient.costPerUnit ? `$${parseFloat(ingredient.costPerUnit).toFixed(2)}` : "-"
                  )}
                </TableCell>
                )}

                {isColumnVisible("pieceWeightOz") && (
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editedValues.pieceWeightOz}
                      onChange={(e) => setEditedValues({ ...editedValues, pieceWeightOz: e.target.value })}
                      className="h-8"
                      placeholder="0.00"
                    />
                  ) : (
                    ingredient.pieceWeightOz ? parseFloat(ingredient.pieceWeightOz).toFixed(2) : "-"
                  )}
                </TableCell>
                )}

                {isColumnVisible("supplier") && (
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editedValues.supplier}
                      onChange={(e) => setEditedValues({ ...editedValues, supplier: e.target.value })}
                      className="h-8"
                      placeholder="Supplier name"
                    />
                  ) : (
                    ingredient.supplier || "-"
                  )}
                </TableCell>
                )}

                {isColumnVisible("shelfLife") && (
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedValues.shelfLife}
                      onChange={(e) => setEditedValues({ ...editedValues, shelfLife: e.target.value })}
                      className="h-8"
                      placeholder="Days"
                    />
                  ) : (
                    ingredient.shelfLife || "-"
                  )}
                </TableCell>
                )}

                {isColumnVisible("minStock") && (
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editedValues.minStock}
                      onChange={(e) => setEditedValues({ ...editedValues, minStock: e.target.value })}
                      className="h-8"
                      placeholder="0.00"
                    />
                  ) : (
                    ingredient.minStock ? parseFloat(ingredient.minStock).toFixed(2) : "-"
                  )}
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
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(ingredient)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(ingredient.id, ingredient.name)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
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
        type="ingredients"
        onSuccess={() => {
          toast({
            title: "Import successful",
            description: "Ingredients have been updated from CSV",
          });
        }}
      />
    </div>
  );
}
