import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'InterviewPrep - AI Interview Preparation Platform',
  description:
    'Ace your next technical interview with our AI-powered preparation platform. Practice concepts, record answers, and build confidence.',
  keywords: ['interview', 'preparation', 'technical', 'coding', 'practice'],
  authors: [{ name: 'InterviewPrep Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
