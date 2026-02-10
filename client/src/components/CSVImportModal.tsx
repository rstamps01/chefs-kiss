import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, CheckCircle, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CSVPreviewModal } from "@/components/CSVPreviewModal";

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  type: "ingredients" | "recipes" | "recipeIngredients";
  onSuccess: () => void;
}

export function CSVImportModal({ open, onClose, type, onSuccess }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCSVContent] = useState<string>("");
  const [preview, setPreview] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    created?: number;
    updated: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const utils = trpc.useUtils();
  const importIngredientsMutation = trpc.csv.importIngredients.useMutation();
  const importRecipesMutation = trpc.csv.importRecipes.useMutation();
  const importRecipeIngredientsMutation = trpc.csv.importRecipeIngredients.useMutation();
  
  // Preview queries
  const { data: previewData, refetch: refetchPreview, isLoading: isLoadingPreview } = trpc.csv.previewIngredientsCSV.useQuery(
    { csvContent },
    { enabled: false }
  );
  const { data: recipePreviewData, refetch: refetchRecipePreview, isLoading: isLoadingRecipePreview } = trpc.csv.previewRecipesCSV.useQuery(
    { csvContent },
    { enabled: false }
  );
  const { data: recipeIngredientPreviewData, refetch: refetchRecipeIngredientPreview, isLoading: isLoadingRecipeIngredientPreview } = trpc.csv.previewRecipeIngredientsCSV.useQuery(
    { csvContent },
    { enabled: false }
  );
  
  const currentPreviewData = type === 'ingredients' ? previewData : type === 'recipes' ? recipePreviewData : recipeIngredientPreviewData;
  const isLoadingCurrentPreview = type === 'ingredients' ? isLoadingPreview : type === 'recipes' ? isLoadingRecipePreview : isLoadingRecipeIngredientPreview;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCSVContent(content);

      // Generate preview (first 5 lines)
      const lines = content.split("\n").slice(0, 5);
      setPreview(lines);
    };
    reader.readAsText(selectedFile);
  };

  const handleShowPreview = async () => {
    if (!csvContent) return;
    
    // Trigger preview query
    if (type === 'ingredients') {
      await refetchPreview();
    } else if (type === 'recipes') {
      await refetchRecipePreview();
    } else {
      await refetchRecipeIngredientPreview();
    }
    
    setShowPreview(true);
  };

  const handleImport = async () => {
    if (!csvContent) return;

    setImporting(true);
    setResult(null);
    setShowPreview(false);

    try {
      let response;

      if (type === "ingredients") {
        response = await importIngredientsMutation.mutateAsync({ csvContent });
      } else if (type === "recipes") {
        response = await importRecipesMutation.mutateAsync({ csvContent });
      } else {
        response = await importRecipeIngredientsMutation.mutateAsync({ csvContent });
      }

      setResult(response);

      if (response.success) {
        // Invalidate queries to refresh data
        if (type === "ingredients") {
          utils.ingredients.list.invalidate();
        } else if (type === "recipes") {
          utils.recipes.list.invalidate();
        } else {
          utils.recipes.list.invalidate(); // Recipe ingredients affect recipes
        }
        onSuccess();
      }
    } catch (error) {
      setResult({
        success: false,
        created: 0,
        updated: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : "Import failed"],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCSVContent("");
    setPreview([]);
    setShowPreview(false);
    setResult(null);
    onClose();
  };
  
  const getPreviewTitle = () => {
    switch (type) {
      case 'ingredients':
        return 'Preview Ingredients Import';
      case 'recipes':
        return 'Preview Recipes Import';
      case 'recipeIngredients':
        return 'Preview Recipe Ingredients Import';
    }
  };

  const getTitle = () => {
    if (type === "ingredients") return "Import Ingredients from CSV";
    if (type === "recipes") return "Import Recipes from CSV";
    return "Import Recipe Ingredients from CSV";
  };

  const getDescription = () => {
    if (type === "ingredients") {
      return "Upload a CSV file with ingredient data. Required columns: id, name, unit. The import will update existing ingredients based on their ID.";
    }
    if (type === "recipes") {
      return "Upload a CSV file with recipe data. Required columns: id, name. The import will update existing recipes based on their ID.";
    }
    return "Upload a CSV file with recipe ingredient data. Required columns: recipeId, ingredientId, quantity, unit. The import will update existing recipe ingredients.";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Click to upload CSV file"}
              </p>
            </label>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Preview (first 5 rows):</h4>
              <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                {preview.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div>
                    <p className="font-medium">Import successful!</p>
                    <p className="text-sm">
                      {result.created ? `Created ${result.created} new, ` : ''}
                      {result.updated > 0 ? `Updated ${result.updated}` : ''}
                      {!result.created && !result.updated ? 'No changes' : ''}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Import failed</p>
                    <p className="text-sm">
                      {result.created ? `Created: ${result.created}, ` : ''}
                      Updated: {result.updated}, Failed: {result.failed}
                    </p>
                    {result.errors.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                        {result.errors.map((error, i) => (
                          <p key={i} className="text-xs">
                            • {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button
              onClick={handleShowPreview}
              disabled={!csvContent || importing || (result?.success ?? false) || isLoadingCurrentPreview}
            >
              {isLoadingCurrentPreview ? "Loading Preview..." : "Preview & Import"}
            </Button>
          </div>
        </div>
        
        {/* Preview Modal */}
        <CSVPreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          previewData={currentPreviewData || null}
          onConfirmImport={handleImport}
          title={getPreviewTitle()}
          isImporting={importing}
        />
      </DialogContent>
    </Dialog>
  );
}
