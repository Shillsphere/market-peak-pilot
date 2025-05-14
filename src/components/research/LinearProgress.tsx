import React from 'react';
import { Progress } from '@/components/ui/progress'; // Assuming you have this shadcn component

interface LinearProgressProps {
  label?: string;
  progress?: number; // Optional progress value (0-100)
}

const LinearProgress: React.FC<LinearProgressProps> = ({ label, progress }) => {
  return (
    <div className="w-full my-2">
      {label && <p className="text-sm text-gray-600 mb-1">{label}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
        {progress !== undefined ? (
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          ></div>
        ) : (
          <div 
            className="bg-primary h-2.5 rounded-full animate-pulse-linear"
            // style={{ width: '40%' }} // Indeterminate uses animation, width is less critical
          ></div>
        )}
      </div>
      <style>{`
        @keyframes pulse-linear {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
        .animate-pulse-linear {
          animation: pulse-linear 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default LinearProgress; 