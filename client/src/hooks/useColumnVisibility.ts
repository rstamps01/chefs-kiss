import { useState, useEffect } from "react";

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

export function useColumnVisibility(
  storageKey: string,
  defaultColumns: ColumnConfig[]
) {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    // Load from localStorage on initial render
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const savedVisibility = JSON.parse(stored) as Record<string, boolean>;
        return defaultColumns.map(col => ({
          ...col,
          visible: savedVisibility[col.id] ?? col.visible,
        }));
      }
    } catch (error) {
      console.error("Failed to load column visibility from localStorage:", error);
    }
    return defaultColumns;
  });

  // Save to localStorage whenever columns change
  useEffect(() => {
    try {
      const visibility = columns.reduce((acc, col) => {
        acc[col.id] = col.visible;
        return acc;
      }, {} as Record<string, boolean>);
      localStorage.setItem(storageKey, JSON.stringify(visibility));
    } catch (error) {
      console.error("Failed to save column visibility to localStorage:", error);
    }
  }, [columns, storageKey]);

  const toggleColumn = (columnId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const resetToDefault = () => {
    setColumns(defaultColumns);
  };

  const isColumnVisible = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    return column?.visible ?? true;
  };

  return {
    columns,
    toggleColumn,
    resetToDefault,
    isColumnVisible,
  };
}
