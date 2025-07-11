import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global mocks for PostHog and Clerk
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    __loaded: true,
  },
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: () => null,
  SignUpButton: ({ children }: { children?: React.ReactNode }) => children || null,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
}))

vi.mock('@/lib/analytics', () => ({
  analytics: {
    dashboardViewed: vi.fn(),
    userSignedIn: vi.fn(),
    onboardingStarted: vi.fn(),
    onboardingCompleted: vi.fn(),
    mealAdded: vi.fn(),
    mealAnalyzed: vi.fn(),
    chatUsed: vi.fn(),
    voiceInputUsed: vi.fn(),
    errorOccurred: vi.fn(),
    nutritionGoalsViewed: vi.fn(),
  },
  identifyUser: vi.fn(),
  trackEvent: vi.fn(),
  initPostHog: vi.fn(),
}))

vi.mock('@/lib/posthog-server', () => ({
  getPostHogClient: vi.fn(() => ({
    identify: vi.fn(),
    capture: vi.fn(),
    shutdown: vi.fn(),
  })),
  serverAnalytics: {
    identifyUser: vi.fn(),
    trackEvent: vi.fn(),
    shutdown: vi.fn(),
  },
}))