import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-2xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 p-8 shadow-xl text-center">
        <p className="text-sm uppercase tracking-wider text-secondary-500 dark:text-secondary-400">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-secondary-900 dark:text-secondary-100">Page not found</h1>
        <p className="mt-3 text-secondary-600 dark:text-secondary-400">
          The page you requested does not exist or was moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl border border-secondary-300 dark:border-secondary-600 text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
