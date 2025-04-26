import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
      <p className="text-gray-400">{message}</p>
    </div>
  );
} 