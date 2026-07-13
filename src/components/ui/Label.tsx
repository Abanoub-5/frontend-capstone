import { forwardRef } from 'react';
import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required, children, htmlFor, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={`block text-sm font-medium text-[var(--text-h)] ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';