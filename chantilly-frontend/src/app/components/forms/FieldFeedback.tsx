import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function FieldFeedback({
  error,
  success,
  successMessage = "Campo válido",
}: {
  error?: string;
  success?: boolean;
  successMessage?: string;
}) {
  if (error) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </p>
    );
  }

  if (success) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {successMessage}
      </p>
    );
  }

  return null;
}
