import React from 'react';
import { cn } from '../utils/cn';

const CircularProgress = ({ 
  value, 
  max = 100, 
  size = 120, 
  strokeWidth = 12, 
  colorClass = "text-indigo-600",
  trackColorClass = "text-slate-100",
  color, // Hex color fallback
  label, // Optional label under the value
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track */}
        <circle
          className={trackColorClass}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress indicator */}
        <circle
          className={cn(!color && colorClass, "transition-all duration-1000 ease-out")}
          stroke={color || "currentColor"}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ? children : (
          <>
            <span className="text-3xl font-bold text-slate-900 leading-none">
              {value}<span className="text-xl text-slate-400">%</span>
            </span>
            {label && (
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
