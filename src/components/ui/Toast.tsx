'use client';

import React, { useEffect } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. Pass 0 to keep it until dismissed. */
  duration?: number;
  onClose: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success:
    'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200',
  error:
    'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-200',
  info:
    'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-800 dark:text-secondary-100',
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-9-3a1 1 0 112 0 1 1 0 01-2 0zm.75 3.5a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V10.5z" clipRule="evenodd" />
    </svg>
  ),
};

/**
 * Lightweight snackbar pinned to the bottom of the viewport.
 * Render it conditionally from a page - it dismisses itself after `duration`.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'success',
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (!duration) return;
    const timeoutId = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-elevated backdrop-blur-sm max-w-md w-full sm:w-auto ${variantStyles[variant]}`}
      >
        {variantIcons[variant]}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
