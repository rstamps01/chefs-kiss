import { Settings } from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnVisibilityControlProps {
  columns: ColumnConfig[];
  onToggleColumn: (columnId: string) => void;
  onResetToDefault: () => void;
}

export function ColumnVisibilityControl({
  columns,
  onToggleColumn,
  onResetToDefault,
}: ColumnVisibilityControlProps) {
  const visibleCount = columns.filter(c => c.visible).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings className="h-4 w-4 mr-2" />
          Columns ({visibleCount}/{columns.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Toggle Columns</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetToDefault}
              className="h-7 text-xs"
            >
              Reset
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={column.visible}
                  onCheckedChange={() => onToggleColumn(column.id)}
                />
                <Label
                  htmlFor={`column-${column.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
