import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Multiline counterpart of <Input>, sharing the same styling and error/helper behaviour.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', rows = 6, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            block w-full rounded-xl border shadow-sm resize-y
            transition-all duration-200
            px-4 py-3 leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-secondary-50 dark:disabled:bg-secondary-800 disabled:cursor-not-allowed
            ${hasError
              ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-400 placeholder-red-300 dark:placeholder-red-600 focus:ring-red-500 focus:border-red-500'
              : 'border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:ring-primary-500 focus:border-primary-500'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-secondary-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
