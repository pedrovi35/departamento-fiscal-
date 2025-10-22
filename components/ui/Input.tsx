import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1', { 'w-full': fullWidth })}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'px-3 py-2 border rounded-lg transition-smooth focus-visible:focus',
            'placeholder:text-gray-400',
            {
              'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200': !error,
              'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200': error,
              'w-full': fullWidth,
            },
            className
          )}
          {...props}
        />
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

