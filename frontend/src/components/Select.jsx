import React from 'react';
import { cn } from '../utils/cn';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, label, error, helperText, options = [], children, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow shadow-sm text-slate-900",
            error && "border-rose-500 focus:ring-rose-500",
            className
          )}
          {...props}
        >
          {children}
          {options && options.map((opt, i) => (
            <option key={i} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {(error || helperText) && (
        <p className={cn("text-xs", error ? "text-rose-500" : "text-slate-500")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";
export default Select;
