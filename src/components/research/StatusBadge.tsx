import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react'; // Import Loader icon

type JobStatus = 'queued' | 'running' | 'done' | 'error' | string | undefined;

interface StatusBadgeProps {
  status: JobStatus;
}

// Component to display the job status with appropriate styling
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeVariant = (status: JobStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'done':
        return 'default'; // Use default (often green/blue in themes)
      case 'running':
        return 'secondary'; // Use secondary (often gray/yellow)
      case 'error':
        return 'destructive'; // Use destructive (often red)
      case 'queued':
      default:
        return 'outline'; // Use outline (often gray)
    }
  };

  const statusText = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

  return (
    <Badge variant={getBadgeVariant(status)} className="capitalize flex items-center gap-1">
      {status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />} 
      {statusText}
    </Badge>
  );
}; 