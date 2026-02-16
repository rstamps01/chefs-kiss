import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface QuickAddCategoryButtonProps {
  categoryType: 'recipe' | 'ingredient';
  onCategoryAdded?: (categoryName: string) => void;
}

export function QuickAddCategoryButton({ categoryType, onCategoryAdded }: QuickAddCategoryButtonProps) {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          title="Add new category"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Add New Category</h4>
            <p className="text-sm text-muted-foreground">
              Create a new recipe category
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-category-name-popover">Category Name *</Label>
              <Input
                id="quick-category-name-popover"
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
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setName("");
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={createMutation.isPending || !name.trim()}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
