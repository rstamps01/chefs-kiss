import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface QuickAddUnitDialogProps {
  onUnitAdded?: (unitName: string) => void;
}

export function QuickAddUnitDialog({ onUnitAdded }: QuickAddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const createMutation = trpc.ingredientUnits.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Unit created",
        description: `"${data.displayName}" has been added to your units.`,
      });
      utils.ingredientUnits.listActive.invalidate();
      utils.ingredientUnits.list.invalidate();
      setName("");
      setDisplayName("");
      setOpen(false);
      if (onUnitAdded) {
        onUnitAdded(data.name);
      }
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
    if (!name.trim() || !displayName.trim()) return;
    createMutation.mutate({
      name: name.trim(),
      displayName: displayName.trim(),
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={() => setOpen(true)}
        title="Add new unit"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>
              Create a new ingredient unit that will be available in all ingredient forms.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-unit-name">Unit Name (Internal) *</Label>
              <Input
                id="quick-unit-name"
                placeholder="e.g., gallon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Lowercase, no spaces (used for database storage)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-unit-display">Display Name *</Label>
              <Input
                id="quick-unit-display"
                placeholder="e.g., Gallon (gl)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                How it appears in dropdowns (e.g., "Ounces (oz)")
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setName("");
                  setDisplayName("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !name.trim() || !displayName.trim()}
              >
                {createMutation.isPending ? "Creating..." : "Create Unit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
