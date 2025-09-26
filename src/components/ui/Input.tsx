import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'form-input w-full rounded-xl border-2 shadow-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
              {
                'border-red-300 focus:ring-red-500 focus:border-red-500': error,
                'border-gray-200 hover:border-gray-300': !error,
                'pl-10': icon,
                'pl-4': !icon,
              },
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';