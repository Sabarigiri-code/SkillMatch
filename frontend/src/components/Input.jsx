import React from 'react';
import { cn } from '../utils/cn';

const Input = React.forwardRef(({ className, type = "text", label, error, helperText, leftIcon, rightIcon, style, autoComplete, ...props }, ref) => {
  const isPassword = type === 'password';
  const resolvedType = isPassword ? 'text' : type;
  const resolvedStyle = isPassword 
    ? { WebkitTextSecurity: 'disc', ...(style || {}) }
    : style;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          type={resolvedType}
          ref={ref}
          style={resolvedStyle}
          autoComplete={isPassword ? (autoComplete || "off") : autoComplete}
          data-lpignore={isPassword ? "true" : props['data-lpignore']}
          data-1p-ignore={isPassword ? "true" : props['data-1p-ignore']}
          data-form-type={isPassword ? "other" : props['data-form-type']}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow shadow-sm",
            isPassword && "secure-text-disc",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-rose-500 focus:ring-rose-500",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={cn("text-xs", error ? "text-rose-500" : "text-slate-500")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
