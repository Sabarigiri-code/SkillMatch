import React from 'react';
import { cn } from '../utils/cn';

const ProgressBar = ({ 
  value, 
  progress, // Alias for value to support different prop names used in the app
  max = 100, 
  className, 
  colorClass, 
  color, // Alias for colorClass
  heightClass = "h-2", 
  showLabel = false 
}) => {
  // Use value if provided, fallback to progress, otherwise 0
  const actualValue = value !== undefined ? value : (progress !== undefined ? progress : 0);
  // Use colorClass if provided, fallback to color, otherwise default indigo
  const actualColor = colorClass || color || "bg-indigo-600";
  
  const percentage = Math.min(100, Math.max(0, (actualValue / max) * 100));

  return (
    <div className="w-full flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", heightClass, className)}>
        <div 
          className={cn("h-full rounded-full transition-all duration-500 ease-in-out", actualColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
