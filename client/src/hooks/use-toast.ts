import { useState } from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (options: Toast) => {
    // For now, just log to console
    // In a full implementation, this would add to a toast queue
    console.log(`[Toast ${options.variant || "default"}]`, options.title, options.description);
    
    setToasts(prev => [...prev, options]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
  };

  return {
    toast,
    toasts,
  };
}
