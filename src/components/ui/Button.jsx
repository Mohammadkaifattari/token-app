import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import React, { useRef, useEffect } from 'react';
import { hoverScale, hoverScaleReset } from '../../animations/gsapHelpers';

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  loading = false, 
  ...props 
}) => {
  const btnRef = useRef(null);

  const variants = {
    primary: 'bg-medical-primary text-white hover:brightness-110 shadow-lg shadow-medical-primary/20',
    secondary: 'bg-white text-medical-primary border border-medical-primary/20 hover:bg-medical-primary/5',
    outline: 'bg-transparent text-medical-text border border-slate-200 hover:bg-slate-50',
    ghost: 'bg-transparent text-medical-muted hover:bg-slate-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      ref={btnRef}
      className={cn(
        'px-6 py-2.5 rounded-clinical font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      onMouseEnter={() => !props.disabled && hoverScale(btnRef.current)}
      onMouseLeave={() => !props.disabled && hoverScaleReset(btnRef.current)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
