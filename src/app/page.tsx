import Link from 'next/link';
import { Button, Logo } from '@/components/ui';

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const stats = [
  { value: '10,000+', label: 'Mock interviews conducted' },
  { value: '92%', label: 'Report higher confidence' },
  { value: '48 hrs', label: 'Avg. to measurable improvement' },
  { value: '500+', label: 'Curated concepts & problems' },
];

const roles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'ML Engineer', 'UX Designer', 'DevOps / SRE'];

const featureHighlights = [
  {
    eyebrow: 'AI Mock Interviews',
    title: 'Practice answering like a pro',
    body: 'Record your answers to real interview questions and get instant AI scoring on clarity, depth, and structure—then a targeted action plan to improve.',
    ctaLabel: 'Start an interview',
    ctaHref: '/interview',
    badge: 'Most popular',
    gradientFrom: 'from-primary-600',
    gradientTo: 'to-primary-700',
    lightBg: 'bg-primary-50 dark:bg-primary-900/10',
    borderColor: 'border-primary-100 dark:border-primary-800',
  },
  {
    eyebrow: 'Concept Library',
    title: 'Master every topic at your pace',
    body: 'Browse 500+ curated technical concepts across Algorithms, System Design, Backend, Frontend and more. Practice by explaining them out loud and get AI feedback.',
    ctaLabel: 'Explore concepts',
    ctaHref: '/concepts',
    badge: null,
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-purple-700',
    lightBg: 'bg-violet-50 dark:bg-violet-900/10',
    borderColor: 'border-violet-100 dark:border-violet-800',
  },
  {
    eyebrow: 'Problem Tracker',
    title: 'Track your LeetCode progress',
    body: 'Organize algorithm problems by category, mark solved/attempted/unsolved, and filter by difficulty so you never lose track of your grind.',
    ctaLabel: 'Browse problems',
    ctaHref: '/problems',
    badge: null,
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-700',
    lightBg: 'bg-emerald-50 dark:bg-emerald-900/10',
    borderColor: 'border-emerald-100 dark:border-emerald-800',
  },
];

const features = [
  {
    title: 'Voice-based answers',
    desc: 'Speak naturally and let AI transcribe, analyze tone, pacing, and answer quality—just like a real interview.',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: 'Resume-aware questions',
    desc: 'Upload your resume and Prephire generates targeted questions drilling into your specific experience and gaps.',
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Company-style simulation',
    desc: 'Mirror the style and difficulty of top tech firms—Google loops, Meta design rounds, Amazon BQ—so nothing is unfamiliar.',
    color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Performance analytics',
    desc: 'See score trends, identify weak spots, and watch your readiness grow session over session.',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Any role, any level',
    desc: 'SWE, PM, Data, Design, DevOps—pick your track and seniority. Prephire adapts question depth automatically.',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Instant, actionable feedback',
    desc: 'No waiting. Get a score breakdown with a specific next-best-action after every answer—not vague tips.',
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const steps = [
  {
    n: '01',
    title: 'Set up your profile',
    body: 'Choose your target role and seniority. Optionally upload your resume for a personalised prep plan built in seconds.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Practice daily',
    body: 'Study concepts, solve problems, and run AI mock interviews that generate fresh role-specific questions every session.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Review AI feedback',
    body: 'Read your detailed report—scores, highlights, missed signals—and immediately drill the weak spots.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    n: '04',
    title: 'Walk in ready',
    body: 'With a record of real improvement, you arrive at your on-site with confidence grounded in evidence, not hope.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote: 'Prephire made me feel prepared for curveballs. My on-site loop felt like a replay of my practice sessions.',
    name: 'Jordan M.',
    role: 'Senior Product Manager',
    company: 'Acquired at Series B startup',
    initial: 'J',
    color: 'bg-primary-600',
  },
  {
    quote: 'The tailored drills and feedback loop helped me jump two leveling brackets in a single interview cycle.',
    name: 'Priya S.',
    role: 'Software Engineer',
    company: 'Offer from top-3 tech company',
    initial: 'P',
    color: 'bg-violet-600',
  },
  {
    quote: "I used Prephire for three weeks before my Google loop. It was the most realistic prep I've found — and I got the offer.",
    name: 'Daniel K.',
    role: 'Staff Engineer',
    company: 'L6 at Google',
    initial: 'D',
    color: 'bg-emerald-600',
  },
  {
    quote: 'Uploading my resume and getting questions targeting exactly my gaps was a game-changer. Nothing else does that.',
    name: 'Maya R.',
    role: 'Data Scientist',
    company: 'Placed at Fortune 100',
    initial: 'M',
    color: 'bg-rose-500',
  },
];

/* ─────────────────────────────────────────────
   Inline product mockup sub-components
───────────────────────────────────────────── */
function InterviewMockup() {
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 p-4 shadow-sm">
        <p className="text-[10px] text-secondary-400 mb-1 uppercase tracking-wider font-medium">System Design · Advanced</p>
        <p className="font-semibold text-secondary-900 dark:text-white leading-snug">
          Walk me through how you&apos;d design a distributed rate limiter for a global API gateway.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs text-secondary-500">Recording — 01:23</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Clarity', score: '9.1', note: 'Excellent' },
          { label: 'Depth', score: '7.8', note: 'Add trade-offs' },
          { label: 'Structure', score: '8.4', note: 'Good flow' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 p-3 text-center shadow-sm">
            <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-0.5">{s.score}</p>
            <p className="text-[10px] text-secondary-500 mt-0.5 truncate">{s.note}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3">
        <p className="text-xs font-semibold mb-1">AI Next Action</p>
        <p className="text-xs text-primary-100">
          Mention explicit throughput numbers and explain token-bucket vs sliding window trade-offs.
        </p>
      </div>
    </div>
  );
}

function ConceptsMockup() {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex gap-1.5 flex-wrap mb-2">
        {['Algorithms', 'System Design', 'Backend', 'Frontend', 'Database'].map((g, i) => (
          <span
            key={g}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              i === 0
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 border-secondary-200 dark:border-secondary-700'
            }`}
          >
            {g}
          </span>
        ))}
      </div>
      {[
        { title: 'Binary Search', diff: 'Beginner', icon: '🔍' },
        { title: 'Consistent Hashing', diff: 'Advanced', icon: '🔗' },
        { title: 'CAP Theorem', diff: 'Intermediate', icon: '📐' },
        { title: 'LRU Cache', diff: 'Intermediate', icon: '⚡' },
      ].map((c) => (
        <div
          key={c.title}
          className="flex items-center justify-between rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{c.icon}</span>
            <span className="font-medium text-secondary-900 dark:text-white text-sm">{c.title}</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              c.diff === 'Beginner'
                ? 'bg-green-100 text-green-700'
                : c.diff === 'Advanced'
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {c.diff}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProblemsMockup() {
  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-3 gap-2 mb-1">
        {[
          { label: 'Solved', val: '42', color: 'text-emerald-600' },
          { label: 'Attempted', val: '11', color: 'text-amber-500' },
          { label: 'Remaining', val: '167', color: 'text-secondary-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 p-3 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-secondary-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {[
        { name: 'Two Sum', cat: 'Arrays', status: 'solved' },
        { name: 'Merge Intervals', cat: 'Arrays', status: 'attempted' },
        { name: 'LRU Cache', cat: 'Design', status: 'unsolved' },
        { name: 'Word Ladder', cat: 'BFS', status: 'solved' },
      ].map((p) => (
        <div
          key={p.name}
          className="flex items-center justify-between rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 px-4 py-2.5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                p.status === 'solved' ? 'bg-emerald-500' : p.status === 'attempted' ? 'bg-amber-400' : 'bg-secondary-300'
              }`}
            />
            <span className="font-medium text-secondary-900 dark:text-white text-sm">{p.name}</span>
          </div>
          <span className="text-[10px] text-secondary-400 bg-secondary-50 dark:bg-secondary-700 px-2 py-0.5 rounded-full">{p.cat}</span>
        </div>
      ))}
    </div>
  );
}

const mockupComponents = [<InterviewMockup key="int" />, <ConceptsMockup key="con" />, <ProblemsMockup key="pro" />];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-50">

      {/* ═══ MARKETING HEADER ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-secondary-900/85 border-b border-secondary-200/80 dark:border-secondary-800 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Logo />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/#features"
                className="text-sm font-medium text-secondary-600 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-secondary-600 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-white transition-colors"
              >
                How it works
              </Link>
              <Link
                href="/#testimonials"
                className="text-sm font-medium text-secondary-600 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-white transition-colors"
              >
                Testimonials
              </Link>
            </nav>

            {/* Auth CTAs */}
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-white rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200"
              >
                Log in
              </Link>
              <Link href="/signup">
                <Button size="sm" variant="primary" className="rounded-pill px-4 shadow-elevated font-semibold">
                  Start free
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </header>

      <main>
        {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-900 pt-16 pb-24 sm:pt-20 sm:pb-32">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full bg-primary-200/40 blur-[100px] dark:bg-primary-900/30" />
            <div className="absolute -bottom-32 -left-20 h-[400px] w-[400px] rounded-full bg-accent-200/40 blur-[100px] dark:bg-accent-900/20" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(to right, #4f46e5 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
              {/* Left copy */}
              <div className="flex-1 text-center lg:text-left space-y-7 max-w-2xl mx-auto lg:mx-0">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-primary-50 dark:bg-primary-900/40 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600" />
                  </span>
                  🎁 50 free tokens on signup — no card needed
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-bold leading-[1.08] tracking-tight font-display text-secondary-900 dark:text-white">
                  Prepare{' '}
                  <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-violet-600 bg-clip-text text-transparent">
                    Smarter.
                  </span>
                  <br />
                  Get Hired{' '}
                  <span className="bg-gradient-to-r from-accent-500 to-emerald-500 bg-clip-text text-transparent">
                    Faster.
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-secondary-600 dark:text-secondary-300 max-w-xl leading-relaxed">
                  Prephire runs AI mock interviews for any role. Every session turns into precision feedback—so you know
                  exactly what to fix next and walk into the room with evidence-backed confidence.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto text-base px-8">
                      Start Free — Get 50 Tokens
                    </Button>
                  </Link>
                  <Link href="/#how-it-works">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      See how it works
                    </Button>
                  </Link>
                </div>

                {/* Token trust signal */}
                <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400 justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-400 font-medium text-xs">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-2h2v2zm0-4H9V7h2v2z" />
                    </svg>
                    50 free tokens on signup
                  </span>
                  <span>·</span>
                  <span>No credit card required</span>
                  <span>·</span>
                  <span>Cancel anytime</span>
                </div>

                {/* Role pills */}
                <div className="hidden sm:block space-y-2">
                  <p className="text-xs text-secondary-400 uppercase tracking-widest">Works for every role</p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {roles.map((r) => (
                      <span
                        key={r}
                        className="px-3 py-1 rounded-full bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 text-xs font-medium border border-secondary-200 dark:border-secondary-700"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — product preview */}
              <div className="flex-1 w-full max-w-lg lg:max-w-none">
                <div className="relative">
                  {/* Glow */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-violet-500/20 rounded-3xl blur-2xl" aria-hidden />

                  {/* Browser chrome card */}
                  <div className="relative bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
                    {/* Chrome bar */}
                    <div className="flex items-center gap-1.5 px-4 py-3 bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      <div className="ml-3 flex-1 bg-white dark:bg-secondary-700 rounded-md px-3 py-1 text-xs text-secondary-400 dark:text-secondary-500 border border-secondary-200 dark:border-secondary-600">
                        app.prephire.io/interview
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Question row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-secondary-400 uppercase tracking-wider">System Design · Advanced</p>
                          <p className="font-semibold text-secondary-900 dark:text-white text-sm mt-0.5">
                            Walk me through designing a distributed rate limiter.
                          </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800 whitespace-nowrap">
                          Q 3 / 8
                        </span>
                      </div>

                      {/* Waveform */}
                      <div className="rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 flex items-center gap-3 p-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <div className="flex items-end gap-[3px] h-8 flex-1">
                          {[3, 6, 4, 8, 5, 9, 6, 4, 7, 5, 8, 4, 6, 9, 5, 7, 4, 8, 5, 6, 4, 7, 5, 9, 6, 4, 8, 5, 7, 4].map(
                            (h, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-sm bg-primary-400 dark:bg-primary-500"
                                style={{ height: `${h * 8}%` }}
                              />
                            )
                          )}
                        </div>
                        <span className="text-xs text-secondary-500 font-mono shrink-0">01:42</span>
                      </div>

                      {/* Score cards */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Clarity', score: '9.1', bar: 91, color: 'bg-primary-500' },
                          { label: 'Depth', score: '7.8', bar: 78, color: 'bg-violet-500' },
                          { label: 'Structure', score: '8.4', bar: 84, color: 'bg-accent-500' },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 p-3"
                          >
                            <p className="text-[10px] text-secondary-400 uppercase tracking-wide font-medium">{s.label}</p>
                            <p className="text-xl font-bold text-secondary-900 dark:text-white mt-0.5">{s.score}</p>
                            <div className="mt-1.5 h-1 rounded-full bg-secondary-200 dark:bg-secondary-700">
                              <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.bar}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* AI action card */}
                      <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
                        <div className="flex items-start gap-3">
                          <div className="h-7 w-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-primary-100 uppercase tracking-wide">AI Next Action</p>
                            <p className="text-sm text-white mt-1 leading-snug">
                              Mention token-bucket vs sliding window trade-offs and add explicit throughput numbers.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -bottom-4 -right-4 bg-accent-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-secondary-900">
                    Instant AI feedback
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ STATS BANNER ════════════════════════════════════════════════ */}
        <section className="border-y border-secondary-100 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-secondary-200 dark:divide-secondary-700">
              {stats.map((s) => (
                <div key={s.label} className="text-center lg:px-8">
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent font-display">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRODUCT HIGHLIGHTS ══════════════════════════════════════════ */}
        <section id="features" className="py-24 sm:py-32 bg-white dark:bg-secondary-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                Everything in one platform
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold font-display text-secondary-900 dark:text-white leading-tight">
                Three tools.{' '}
                <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
                  One mission: get the offer.
                </span>
              </h2>
              <p className="text-lg text-secondary-500 dark:text-secondary-400 leading-relaxed">
                Prephire unifies everything a serious candidate needs—no scattered tabs, no guesswork.
              </p>
            </div>

            {/* Alternating feature rows */}
            <div className="space-y-16">
              {featureHighlights.map((fh, idx) => (
                <div
                  key={fh.eyebrow}
                  className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-center`}
                >
                  {/* Copy side */}
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r ${fh.gradientFrom} ${fh.gradientTo} text-white`}
                      >
                        {fh.eyebrow}
                      </span>
                      {fh.badge && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          ★ {fh.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-bold font-display text-secondary-900 dark:text-white leading-snug">
                      {fh.title}
                    </h3>
                    <p className="text-lg text-secondary-500 dark:text-secondary-400 leading-relaxed max-w-lg">{fh.body}</p>
                    <Link href={fh.ctaHref}>
                      <Button variant="primary" size="lg" className="mt-2">
                        {fh.ctaLabel}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </Link>
                  </div>

                  {/* Mockup side */}
                  <div className="flex-1 w-full max-w-md lg:max-w-none">
                    <div className={`rounded-2xl ${fh.lightBg} border ${fh.borderColor} p-5 shadow-xl`}>
                      {mockupComponents[idx]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURE GRID ════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-secondary-50 dark:bg-secondary-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
              <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                Under the hood
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-secondary-900 dark:text-white">
                Built around how real interviews work
              </h2>
              <p className="text-secondary-500 dark:text-secondary-400 text-lg">
                Every detail mirrors actual hiring loops at top companies.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 p-6 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-200"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color} mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-secondary-900 dark:text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-24 sm:py-32 bg-white dark:bg-secondary-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div className="max-w-xl space-y-3">
                <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                  How it works
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold font-display text-secondary-900 dark:text-white leading-tight">
                  From first session to offer letter — four steps.
                </h2>
              </div>
              <Link href="/signup">
                <Button variant="accent" size="lg">Start free — 50 tokens included</Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Connecting line */}
              <div className="absolute top-[22px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-100 via-primary-300 to-accent-300 dark:from-primary-900 dark:via-primary-700 dark:to-accent-700 hidden lg:block pointer-events-none" />

              {steps.map((step) => (
                <div
                  key={step.n}
                  className="relative bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl border border-secondary-200 dark:border-secondary-700 p-6 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-violet-600 text-white shadow-lg mb-4">
                    {step.icon}
                  </div>
                  <span className="absolute top-5 right-5 text-5xl font-black text-secondary-100 dark:text-secondary-800 leading-none select-none">
                    {step.n}
                  </span>
                  <h3 className="font-semibold text-secondary-900 dark:text-white text-lg mb-2 leading-snug">{step.title}</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ════════════════════════════════════════════════ */}
        <section id="testimonials" className="py-24 sm:py-32 bg-secondary-50 dark:bg-secondary-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
              <span className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                Real results
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold font-display text-secondary-900 dark:text-white leading-tight">
                Candidates who prepared with Prephire
              </h2>
              <p className="text-secondary-500 dark:text-secondary-400 text-lg">
                From first-time seekers to senior leaders — prep works when it mirrors reality.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 p-6 flex flex-col gap-4 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-200"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-secondary-700 dark:text-secondary-300 text-sm leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-secondary-100 dark:border-secondary-700">
                    <div
                      className={`h-9 w-9 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    >
                      {t.initial}
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-sm">{t.name}</p>
                      <p className="text-xs text-secondary-400 dark:text-secondary-500">{t.role}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ RESUME SPOTLIGHT ════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-white dark:bg-secondary-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-900 to-secondary-800 dark:from-secondary-800 dark:to-secondary-900 border border-secondary-700 p-10 sm:p-16 text-white shadow-2xl">
              {/* BG glows */}
              <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-primary-600/30 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

              <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16">
                {/* Copy */}
                <div className="flex-1 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white/80 font-medium">
                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    AI Resume Lens
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
                    Interview questions built{' '}
                    <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
                      around your story.
                    </span>
                  </h3>
                  <p className="text-secondary-300 text-lg leading-relaxed max-w-lg">
                    Upload your resume and Prephire generates a curated drill set targeting your actual experience gaps—so
                    you never waste time on questions that won&apos;t come up.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link href="/resume">
                      <Button variant="primary" size="lg">Upload your resume</Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Create free account
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Resume preview card */}
                <div className="flex-1 w-full max-w-sm">
                  <div className="bg-secondary-900/60 backdrop-blur border border-secondary-700 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-secondary-700">
                      <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">resume_2026.pdf</p>
                        <p className="text-xs text-secondary-400">Analyzed · 42 questions generated</p>
                      </div>
                    </div>
                    <p className="text-xs text-secondary-400 uppercase tracking-wider font-medium">AI-Generated Questions</p>
                    {[
                      'You listed Kafka at scale—how did you handle consumer lag in production?',
                      'Walk me through the tradeoffs of your microservice split at TechCorp.',
                      'Your resume shows a 6-month gap—how did you keep skills sharp?',
                    ].map((q, i) => (
                      <div key={i} className="rounded-xl bg-secondary-800/60 border border-secondary-700 p-3">
                        <p className="text-xs text-white/80 leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ════════════════════════════════════════════════════ */}
        <section id="cta" className="py-24 sm:py-32 bg-secondary-50 dark:bg-secondary-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/40 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium">
              🎯 Your next offer letter starts here
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-secondary-900 dark:text-white leading-tight">
              Stop hoping.{' '}
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-violet-600 bg-clip-text text-transparent">
                Start proving you&apos;re ready.
              </span>
            </h2>
            <p className="text-xl text-secondary-500 dark:text-secondary-400 max-w-2xl mx-auto leading-relaxed">
              Prephire compresses months of scattered prep into a tight, data-driven loop. Join candidates who arrived at
              their interviews with evidence-backed confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-base px-10">
                  Start Free — Get 50 Tokens
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Sign in to dashboard
                </Button>
              </Link>
            </div>
            <p className="text-sm text-secondary-400 dark:text-secondary-500">
              🎁 50 tokens free on signup · no credit card required · cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer className="bg-secondary-900 dark:bg-secondary-900 text-white border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="inline-block group">
                <Logo />
              </Link>
              <p className="text-secondary-400 text-sm leading-relaxed max-w-xs">
                AI-powered interview preparation built for ambitious candidates who want to prepare smarter and get hired faster.
              </p>
              <p className="text-xs text-secondary-600">© 2026 Prephire. All rights reserved.</p>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-secondary-400">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'AI Interviews', href: '/interview' },
                  { label: 'Concept Library', href: '/concepts' },
                  { label: 'Problem Tracker', href: '/problems' },
                  { label: 'Resume Analyzer', href: '/resume' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-secondary-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-secondary-400">Account</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Sign up free', href: '/signup' },
                  { label: 'Log in', href: '/login' },
                  { label: 'Profile', href: '/profile' },
                  { label: 'Tokens & Billing', href: '/tokens' },
                  { label: 'Settings', href: '/settings' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-secondary-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Discover */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-secondary-400">Discover</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Features', href: '/#features' },
                  { label: 'How it works', href: '/#how-it-works' },
                  { label: 'Testimonials', href: '/#testimonials' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-secondary-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-3 space-y-2">
                <p className="text-xs text-secondary-500 uppercase tracking-widest">Supported roles</p>
                <div className="flex flex-wrap gap-1.5">
                  {['SWE', 'PM', 'Data', 'Design', 'DevOps'].map((r) => (
                    <span
                      key={r}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-800 border border-secondary-700 text-secondary-400"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
