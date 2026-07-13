import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className = '', showCharCount = false, maxLength, 'aria-describedby': ariaDescribedBy, ...props }, ref) => {
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint && !error ? `${id}-hint` : undefined;
    const countId = showCharCount && maxLength ? `${id}-count` : undefined;
    const describedBy = [errorId, hintId, countId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;
    const currentLength = (props.value as string)?.length || 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[var(--text)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            className={`
              w-full px-3 py-2 text-sm text-[var(--text)] bg-[var(--bg)]
              border rounded-md transition-colors duration-150 resize-y min-h-[100px]
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border)]'}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            maxLength={maxLength}
            {...props}
          />
          {showCharCount && maxLength && (
            <div
              id={countId}
              className="absolute bottom-2 right-2 text-xs text-[var(--text-muted)] pointer-events-none"
              aria-live="polite"
            >
              {currentLength}/{maxLength}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-sm text-[var(--text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };