import React from 'react';
import { cn } from '../utils/cn';

const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    primary: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
    outline: "text-slate-600 border border-slate-200 dark:text-slate-400 dark:border-slate-700"
  };

  return (
    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2", variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export default Badge;
