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

interface QuickAddCategoryDialogProps {
  categoryType: 'recipe' | 'ingredient';
  onCategoryAdded?: (categoryName: string) => void;
}

export function QuickAddCategoryDialog({ categoryType, onCategoryAdded }: QuickAddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const createMutation = trpc.recipeCategories.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Category created",
        description: `"${data.name}" has been added to your categories.`,
      });
      utils.recipeCategories.listActive.invalidate();
      utils.recipeCategories.list.invalidate();
      setName("");
      setOpen(false);
      if (onCategoryAdded) {
        onCategoryAdded(data.name);
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
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), categoryType });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={() => setOpen(true)}
        title="Add new category"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new recipe category that will be available in all recipe forms.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-category-name">Category Name *</Label>
              <Input
                id="quick-category-name"
                placeholder="e.g., Beverages"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setName("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
                {createMutation.isPending ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
