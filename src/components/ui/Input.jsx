import React from 'react';
import { cn } from './Button';

export const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-medical-text ml-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-clinical border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all bg-white placeholder:text-slate-400',
          error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
    </div>
  );
};
