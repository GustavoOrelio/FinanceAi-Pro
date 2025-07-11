import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className = "" }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="mt-4 text-sm text-muted-foreground text-center">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4"
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
} 