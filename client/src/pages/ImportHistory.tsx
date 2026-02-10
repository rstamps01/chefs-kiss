import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { RollbackDialog } from '@/components/RollbackDialog';

type ImportType = 'ingredients' | 'recipes' | 'recipeIngredients';
type ImportStatus = 'completed' | 'rolled_back';

export function ImportHistory() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [importTypeFilter, setImportTypeFilter] = useState<ImportType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ImportStatus | 'all'>('all');
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState<number | null>(null);

  const { data: imports, isLoading, refetch } = trpc.importHistory.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
    importType: importTypeFilter === 'all' ? undefined : importTypeFilter,
  });

  const filteredImports = imports?.filter(imp => {
    if (statusFilter === 'all') return true;
    return imp.status === statusFilter;
  }) || [];

  const handleRollback = (importId: number) => {
    setSelectedImportId(importId);
    setRollbackDialogOpen(true);
  };

  const handleRollbackSuccess = () => {
    setRollbackDialogOpen(false);
    setSelectedImportId(null);
    refetch();
  };

  const getImportTypeBadge = (type: string) => {
    const colors = {
      ingredients: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      recipes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      recipeIngredients: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    const labels = {
      ingredients: 'Ingredients',
      recipes: 'Recipes',
      recipeIngredients: 'Recipe Ingredients',
    };
    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        Rolled Back
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            View and manage all CSV import operations. You can rollback imports to revert changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Import Type</label>
              <Select
                value={importTypeFilter}
                onValueChange={(value) => setImportTypeFilter(value as ImportType | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ingredients">Ingredients</SelectItem>
                  <SelectItem value="recipes">Recipes</SelectItem>
                  <SelectItem value="recipeIngredients">Recipe Ingredients</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ImportStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rolled_back">Rolled Back</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Page Size</label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading import history...</div>
          ) : filteredImports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No import history found. Import some data to see it here.
            </div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Import Type</TableHead>
                      <TableHead>Records Created</TableHead>
                      <TableHead>Records Updated</TableHead>
                      <TableHead>Total Records</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredImports.map((imp) => (
                      <TableRow key={imp.id}>
                        <TableCell className="font-medium">
                          {formatDate(imp.timestamp)}
                        </TableCell>
                        <TableCell>{getImportTypeBadge(imp.importType)}</TableCell>
                        <TableCell>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            +{imp.recordsCreated}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            ~{imp.recordsUpdated}
                          </span>
                        </TableCell>
                        <TableCell>{imp.totalRecords}</TableCell>
                        <TableCell>{getStatusBadge(imp.status)}</TableCell>
                        <TableCell>
                          {imp.status === 'completed' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRollback(imp.id)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Rollback
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {imp.rolledBackAt ? `Rolled back ${formatDate(imp.rolledBackAt)}` : 'Already rolled back'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, filteredImports.length)} of {filteredImports.length} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={filteredImports.length < pageSize}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Rollback Dialog */}
      {selectedImportId && (
        <RollbackDialog
          open={rollbackDialogOpen}
          onOpenChange={setRollbackDialogOpen}
          importId={selectedImportId}
          onSuccess={handleRollbackSuccess}
        />
      )}
    </div>
  );
}
