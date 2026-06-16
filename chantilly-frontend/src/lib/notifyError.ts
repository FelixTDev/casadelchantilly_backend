import { toast } from "sonner";
import { getUserErrorMessage } from "./apiError";

export function showRequestError(error: unknown, fallback?: string) {
  toast.error(getUserErrorMessage(error, fallback));
}
