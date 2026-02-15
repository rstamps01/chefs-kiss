import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type RowValidationStatus = 'valid' | 'warning' | 'error';

interface RowValidation {
  rowIndex: number;
  rowNumber: number;
  status: RowValidationStatus;
  operation?: 'create' | 'update';
  errors: string[];
  warnings: string[];
  data: any;
}

interface CSVPreviewResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  rows: RowValidation[];
  globalErrors: string[];
  columnMapping: { csvColumn: string; dbField: string; required: boolean }[];
}

interface CSVPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: CSVPreviewResult | null;
  onConfirmImport: () => void;
  title: string;
  isImporting?: boolean;
  importType?: 'ingredients' | 'recipes' | 'recipeIngredients';
  onFindIds?: (updatedRows: RowValidation[]) => void;
}

export function CSVPreviewModal({
  open,
  onOpenChange,
  previewData,
  onConfirmImport,
  title,
  isImporting = false,
  importType,
  onFindIds,
}: CSVPreviewModalProps) {
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [isFindingIds, setIsFindingIds] = useState(false);
  const [updatedRowIndices, setUpdatedRowIndices] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  if (!previewData) {
    return null;
  }

  const { totalRows, validRows, errorRows, warningRows, rows, globalErrors, columnMapping } = previewData;
  
  // Get all column names from first row
  const columns = rows.length > 0 ? Object.keys(rows[0].data) : [];

  const getStatusIcon = (status: RowValidationStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: RowValidationStatus) => {
    switch (status) {
      case 'valid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Valid</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
    }
  };

  const getOperationBadge = (operation?: 'create' | 'update') => {
    if (!operation) return null;
    
    switch (operation) {
      case 'create':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Create</Badge>;
      case 'update':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Update</Badge>;
    }
  };

  const getRowClassName = (status: RowValidationStatus) => {
    switch (status) {
      case 'valid':
        return '';
      case 'warning':
        return 'bg-yellow-50/50';
      case 'error':
        return 'bg-red-50/50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Review the data before importing. Rows with errors cannot be imported.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Summary Statistics */}
          <div className="grid grid-cols-6 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
              <Info className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-semibold">{totalRows}</div>
                <div className="text-xs text-muted-foreground">Total Rows</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-green-50/50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-semibold text-green-700">{validRows}</div>
                <div className="text-xs text-muted-foreground">Valid</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-yellow-50/50">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-semibold text-yellow-700">{warningRows}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-red-50/50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-semibold text-red-700">{errorRows}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-green-100/50">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
              <div>
                <div className="text-2xl font-semibold text-green-800">{rows.filter(r => r.operation === 'create').length}</div>
                <div className="text-xs text-muted-foreground">Will Create</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-blue-100/50">
              <Info className="h-5 w-5 text-blue-700" />
              <div>
                <div className="text-2xl font-semibold text-blue-800">{rows.filter(r => r.operation === 'update').length}</div>
                <div className="text-xs text-muted-foreground">Will Update</div>
              </div>
            </div>
          </div>

          {/* Color Legend - Show when Find IDs has been used */}
          {updatedRowIndices.size > 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                <span className="font-semibold">Blue highlighted rows</span> indicate ingredients that had their IDs automatically populated by the "Find IDs" feature, converting them from creates to updates.
              </AlertDescription>
            </Alert>
          )}

          {/* Global Errors */}
          {globalErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Critical Errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {globalErrors.map((error, idx) => (
                    <li key={idx} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Column Mapping Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColumnMapping(!showColumnMapping)}
            >
              {showColumnMapping ? 'Hide' : 'Show'} Column Mapping
            </Button>
          </div>

          {/* Column Mapping Table */}
          {showColumnMapping && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="text-sm font-medium mb-2">Column Mapping</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium text-muted-foreground">CSV Column</div>
                <div className="font-medium text-muted-foreground">Database Field</div>
                <div className="font-medium text-muted-foreground">Required</div>
                {columnMapping.map((mapping, idx) => (
                  <>
                    <div key={`csv-${idx}`} className="font-mono text-xs">{mapping.csvColumn}</div>
                    <div key={`db-${idx}`} className="font-mono text-xs">{mapping.dbField}</div>
                    <div key={`req-${idx}`}>
                      {mapping.required ? (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Optional</span>
                      )}
                    </div>
                  </>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="border rounded-lg overflow-auto flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  {columns.map(col => (
                    <TableHead key={col} className="min-w-[120px]">
                      {col}
                      {columnMapping.find(m => m.csvColumn === col)?.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </TableHead>
                  ))}
                  <TableHead className="w-16">Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isUpdatedByFindIds = updatedRowIndices.has(row.rowIndex);
                  const baseClassName = getRowClassName(row.status);
                  const highlightClassName = isUpdatedByFindIds ? 'bg-blue-50 border-l-4 border-l-blue-500' : '';
                  
                  return (
                  <TableRow key={row.rowIndex} className={`${baseClassName} ${highlightClassName}`}>
                    <TableCell className="font-mono text-xs">{row.rowNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(row.status)}
                          {getStatusBadge(row.status)}
                        </div>
                        {row.operation && (
                          <div className="flex items-center gap-1">
                            {getOperationBadge(row.operation)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {columns.map(col => (
                      <TableCell key={col} className="font-mono text-xs">
                        {row.data[col] || <span className="text-muted-foreground italic">empty</span>}
                      </TableCell>
                    ))}
                    <TableCell>
                      {(row.errors.length > 0 || row.warnings.length > 0) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-sm">
                              {row.errors.length > 0 && (
                                <div className="mb-2">
                                  <div className="font-semibold text-red-600 mb-1">Errors:</div>
                                  <ul className="list-disc list-inside space-y-1">
                                    {row.errors.map((error, idx) => (
                                      <li key={idx} className="text-xs">{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {row.warnings.length > 0 && (
                                <div>
                                  <div className="font-semibold text-yellow-600 mb-1">Warnings:</div>
                                  <ul className="list-disc list-inside space-y-1">
                                    {row.warnings.map((warning, idx) => (
                                      <li key={idx} className="text-xs">{warning}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {importType === 'ingredients' && onFindIds && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsFindingIds(true);
                    // Extract names from rows that don't have IDs
                    const names = rows
                      .filter(row => !row.data.id || row.data.id === '')
                      .map(row => row.data.name)
                      .filter(Boolean);
                    
                    if (names.length === 0) {
                      setIsFindingIds(false);
                      return;
                    }

                    try {
                      // Call the lookup endpoint
                      const response = await fetch('/api/trpc/csv.lookupIngredientIds', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ names }),
                      });
                      
                      const result = await response.json();
                      const nameToIdMap = result.result?.data?.nameToIdMap || {};
                      
                      // Update rows with found IDs and track which ones were updated
                      const newUpdatedIndices = new Set<number>();
                      const updatedRows = rows.map((row, index) => {
                        if (!row.data.id || row.data.id === '') {
                          const normalizedName = row.data.name?.toLowerCase().trim();
                          const foundId = nameToIdMap[normalizedName];
                          
                          if (foundId) {
                            newUpdatedIndices.add(row.rowIndex);
                            return {
                              ...row,
                              data: { ...row.data, id: foundId.toString() },
                              operation: 'update' as const,
                            };
                          }
                        }
                        return row;
                      });
                      
                      // Update the set of updated row indices
                      setUpdatedRowIndices(newUpdatedIndices);
                      
                      // Count how many IDs were found
                      const matchedCount = Object.keys(nameToIdMap).length;
                      const totalSearched = names.length;
                      
                      // Show toast with match statistics
                      toast({
                        title: "ID Lookup Complete",
                        description: `Found IDs for ${matchedCount} out of ${totalSearched} ingredients`,
                        variant: matchedCount > 0 ? "default" : "destructive",
                      });
                      
                      onFindIds(updatedRows);
                    } catch (error) {
                      console.error('Failed to lookup IDs:', error);
                    } finally {
                      setIsFindingIds(false);
                    }
                  }}
                  disabled={isImporting || isFindingIds}
                >
                  {isFindingIds ? 'Finding IDs...' : 'Find IDs'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
                Cancel
              </Button>
              <Button
                onClick={onConfirmImport}
                disabled={errorRows > 0 || isImporting}
              >
                {isImporting ? 'Importing...' : `Import ${validRows + warningRows} Valid Rows`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
