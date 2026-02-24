'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import logger from '@/lib/logger';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error('global-error', 'Unhandled app error', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-2xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">Something went wrong</h1>
          <p className="mt-3 text-secondary-600 dark:text-secondary-400">
            We hit an unexpected issue. You can retry this screen or return to the dashboard.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl border border-secondary-300 dark:border-secondary-600 text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
