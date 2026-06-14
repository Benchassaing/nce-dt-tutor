"use client";

import { useToast as useToastPrimitive } from "@/components/ui/toast";
import { useCallback } from "react";

export function useToast() {
  const { toast, dismiss, toasts } = useToastPrimitive();

  const success = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: "success" });
  }, [toast]);

  const error = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: "destructive" });
  }, [toast]);

  const warning = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: "warning" });
  }, [toast]);

  const info = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: "default" });
  }, [toast]);

  const achievement = useCallback((title: string, description?: string) => {
    toast({
      title: `🏆 ${title}`,
      description,
      variant: "success",
      duration: 8000,
    });
  }, [toast]);

  return { toast, dismiss, toasts, success, error, warning, info, achievement };
}