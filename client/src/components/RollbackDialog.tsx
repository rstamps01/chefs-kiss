import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RollbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importId: number;
  onSuccess: () => void;
}

export function RollbackDialog({ open, onOpenChange, importId, onSuccess }: RollbackDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();

  const { data: importRecord, isLoading: loadingRecord } = trpc.importHistory.getById.useQuery(
    { id: importId },
    { enabled: open }
  );

  const rollbackMutation = trpc.importHistory.rollback.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Rollback Successful',
        description: `Deleted ${result.deletedCount} created records and restored ${result.restoredCount} updated records.`,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Rollback Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRollback = () => {
    if (!confirmed) {
      toast({
        title: 'Confirmation Required',
        description: 'Please confirm that you understand this action cannot be undone.',
        variant: 'destructive',
      });
      return;
    }

    rollbackMutation.mutate({ importHistoryId: importId });
  };

  const getImportTypeLabel = (type: string) => {
    const labels = {
      ingredients: 'Ingredients',
      recipes: 'Recipes',
      recipeIngredients: 'Recipe Ingredients',
    };
    return labels[type as keyof typeof labels] || type;
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

  const snapshotData = importRecord?.snapshotData as {
    created?: number[];
    updated?: Array<{ id: number; data: Record<string, any> }>;
  } | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rollback Import</DialogTitle>
          <DialogDescription>
            Review the import details and confirm rollback. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {loadingRecord ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : importRecord ? (
          <div className="space-y-4">
            {/* Import Details */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Import Type:</span>
                <Badge>{getImportTypeLabel(importRecord.importType)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Import Date:</span>
                <span className="text-sm">{formatDate(importRecord.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Records Created:</span>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  +{importRecord.recordsCreated}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Records Updated:</span>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  ~{importRecord.recordsUpdated}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Records:</span>
                <span className="text-sm font-medium">{importRecord.totalRecords}</span>
              </div>
            </div>

            {/* Rollback Preview */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">What will happen:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {snapshotData?.created && snapshotData.created.length > 0 && (
                    <li>
                      <strong>{snapshotData.created.length}</strong> created records will be{' '}
                      <strong className="text-red-600 dark:text-red-400">permanently deleted</strong>
                    </li>
                  )}
                  {snapshotData?.updated && snapshotData.updated.length > 0 && (
                    <li>
                      <strong>{snapshotData.updated.length}</strong> updated records will be{' '}
                      <strong className="text-blue-600 dark:text-blue-400">restored</strong> to their previous values
                    </li>
                  )}
                  <li>This import will be marked as "Rolled Back" and cannot be rolled back again</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Confirmation Checkbox */}
            <div className="flex items-start space-x-2 p-4 bg-muted rounded-lg">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <label
                htmlFor="confirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I understand this action cannot be undone and will permanently delete {snapshotData?.created?.length || 0} records
                and restore {snapshotData?.updated?.length || 0} records to their previous state.
              </label>
            </div>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load import details. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={rollbackMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRollback}
            disabled={!confirmed || rollbackMutation.isPending || !importRecord}
          >
            {rollbackMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rolling Back...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Rollback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
