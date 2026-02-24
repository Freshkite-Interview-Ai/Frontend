# Interview Prep Platform - Frontend

A modern AI Interview Preparation Platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Keycloak (OAuth 2.0)
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Form Handling:** React Hook Form
- **Validation:** Zod

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard page
│   ├── concepts/          # Concepts listing page
│   ├── record/[conceptId]/ # Audio recording page
│   ├── resume/            # Resume upload page
│   ├── interview/         # Interview session page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Loading.tsx
│   ├── layout/            # Layout components
│   │   ├── Navbar.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── PageHeader.tsx
│   ├── features/          # Feature-specific components
│   │   ├── AudioRecorder.tsx
│   │   ├── FileUpload.tsx
│   │   └── ConceptCard.tsx
│   └── providers/         # Context providers
│       └── AuthProvider.tsx
├── services/              # API services
│   ├── api.ts             # Axios instance
│   ├── keycloak.ts        # Keycloak configuration
│   ├── authService.ts     # Authentication service
│   ├── conceptService.ts  # Concepts API
│   ├── audioService.ts    # Audio upload API
│   ├── resumeService.ts   # Resume API
│   └── interviewService.ts # Interview API
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useApi.ts          # API request hook
│   └── useAudioRecorder.ts # Audio recording hook
├── store/                 # Zustand stores
│   ├── authStore.ts       # Authentication state
│   └── appStore.ts        # Application state
├── types/                 # TypeScript types
│   ├── index.ts           # Type definitions
│   └── schemas.ts         # Zod schemas
└── middleware.ts          # Next.js middleware
```

## 🔧 Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Keycloak server (for authentication)

### Installation

1. Clone the repository:
```bash
cd "Interview App/Frontend"
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=interview-prep
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=interview-app

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Keycloak Setup

### Creating a Realm

1. Access Keycloak admin console
2. Create a new realm: `interview-prep`
3. Create a client: `interview-app`
4. Configure client settings:
   - Client Protocol: `openid-connect`
   - Access Type: `public`
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`

### User Registration

1. Enable user registration in realm settings
2. Configure email settings (optional)
3. Set up password policies as needed

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features overview |
| `/login` | Login page with Keycloak SSO |
| `/dashboard` | User dashboard with stats and quick actions |
| `/concepts` | Browse and filter technical concepts |
| `/record/[id]` | Record audio answer for a concept |
| `/resume` | Upload and manage resume |
| `/interview` | Start and manage mock interviews |

## 🎨 UI Components

### Button
```tsx
<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

### Card
```tsx
<Card hover padding="md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Input
```tsx
<Input
  label="Email"
  error="Invalid email"
  leftIcon={<Icon />}
/>
```

## 🪝 Custom Hooks

### useAuth
```tsx
const { user, isAuthenticated, login, logout } = useAuth();
```

### useApi
```tsx
const { data, isLoading, error, execute } = useApi(apiFunction);
```

### useAudioRecorder
```tsx
const {
  isRecording,
  duration,
  audioBlob,
  startRecording,
  stopRecording,
} = useAudioRecorder();
```

## 🔌 API Services

All API services are configured to automatically attach the Keycloak token to requests.

```tsx
import { conceptService } from '@/services';

// Get all concepts
const concepts = await conceptService.getConcepts();

// Upload audio
await audioService.uploadAudio(conceptId, blob, duration);

// Upload resume
await resumeService.uploadResume(file);
```

## 📦 State Management

Using Zustand for global state:

```tsx
import { useAuthStore, useAppStore } from '@/store';

// Auth state
const { user, token, isAuthenticated } = useAuthStore();

// App state
const { concepts, resume, currentInterview } = useAppStore();
```

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:cf` | Build Next.js + convert output for Cloudflare Pages |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run check` | Run typecheck + lint + build |
| `npm run preview:cf` | Preview Cloudflare Pages output locally |

## ☁️ Cloudflare Pages Deployment

This project is configured for Cloudflare deployment using the OpenNext Cloudflare adapter.

### Required files

- `wrangler.toml` configured with:
  - `compatibility_flags = ["nodejs_compat"]`
  - `main = ".open-next/worker.js"`
  - `assets.directory = ".open-next/assets"`

### Build command for Cloudflare

```bash
npm run build:cf
```

### Deploy command

```bash
npm run deploy:cf
```

### Important note for Windows

OpenNext can run on Windows, but reliability is better on Linux/WSL for production builds. Use one of:

- Cloudflare CI build on Linux
- WSL2 (Ubuntu) locally
- GitHub Actions/Linux runner for build + deploy

## 🚧 Future Enhancements (AI Features)

- AI-powered interview questions
- Speech-to-text transcription
- Answer evaluation and feedback
- Resume parsing and analysis
- Personalized learning paths

## 📄 License

MIT License
