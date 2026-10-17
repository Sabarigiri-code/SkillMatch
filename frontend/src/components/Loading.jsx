import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const Loading = ({ className, size = 'md', text = "Loading..." }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-slate-500 gap-3", className)}>
      <Loader2 className={cn("animate-spin text-indigo-600", sizes[size])} />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
};

export default Loading;
