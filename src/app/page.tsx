import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-secondary-900 dark:text-white">InterviewPrep</span>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 dark:text-white leading-tight">
              Ace Your Next
              <span className="text-primary-600 dark:text-primary-400"> Technical Interview</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              Practice coding concepts, record your answers, and get ready for your dream job
              with our AI-powered interview preparation platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Start Practicing
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 font-semibold rounded-xl hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-all text-lg"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-10 inline-flex flex-col sm:flex-row items-center justify-center gap-3 rounded-2xl border border-primary-100 bg-white/80 px-6 py-4 text-sm text-secondary-700 shadow-sm backdrop-blur dark:border-primary-900/40 dark:bg-secondary-800/80 dark:text-secondary-200">
              <span className="font-semibold text-secondary-900 dark:text-white">Company visibility</span>
              <span>Public profiles can be viewed by hiring teams, so they can reach out and hire you.</span>
            </div>
          </div>

          {/* Features Section */}
          <section id="features" className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-white">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
                Our comprehensive platform helps you prepare for technical interviews
                with practice questions, audio recordings, and structured learning.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-primary-600 dark:text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  Concept Library
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Access a comprehensive library of technical concepts covering data structures,
                  algorithms, system design, and more.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  Audio Recording
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Practice explaining concepts out loud with our built-in audio recorder.
                  Perfect for improving your communication skills.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  Resume Analysis
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Upload your resume and get personalized interview questions tailored
                  to your experience and skills.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  Mock Interviews
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Simulate real interview experiences with timed sessions and structured
                  question flows to build confidence.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  Progress Tracking
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Track your learning progress across different topics and identify
                  areas that need more practice.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-sm border border-secondary-100 dark:border-secondary-700 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  Secure & Private
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Your data is encrypted and secure. Practice with confidence knowing
                  your recordings are private.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-32 text-center">
            <div className="bg-primary-600 rounded-3xl p-12 sm:p-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Start Your Interview Prep?
              </h2>
              <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-8">
                Join thousands of developers who have improved their interview skills
                with our platform.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-lg text-lg"
              >
                Get Started Free
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-secondary-200 dark:border-secondary-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-secondary-600 dark:text-secondary-400">
            © 2026 InterviewPrep. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
