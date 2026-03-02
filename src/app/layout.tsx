import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider, ThemeProvider } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Prephire – AI Interview Prep Platform',
  description:
    'Prepare for any kind of interview and get hired. Prephire delivers AI-powered mock interviews, tailored question banks, and real-time feedback built for ambitious candidates.',
  keywords: [
    'Prephire',
    'AI interview prep',
    'mock interview',
    'technical interview',
    'product design interview',
    'behavioral interview',
  ],
  authors: [{ name: 'Prephire Team' }],
  openGraph: {
    title: 'Prephire – AI Interview Prep Platform',
    description:
      'Prepare for any kind of interview and get hired. AI-powered mock interviews, tailored question banks, and real-time feedback.',
    url: 'https://prephire.app',
    siteName: 'Prephire',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prephire – AI Interview Prep Platform',
    description:
      'AI-powered mock interviews with real-time feedback so you can prepare smarter and get hired faster.',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e3a8a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
