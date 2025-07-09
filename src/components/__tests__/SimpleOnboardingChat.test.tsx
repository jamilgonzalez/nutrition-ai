import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import SimpleOnboardingChat from '../SimpleOnboardingChat'

// Mock the useChat hook
vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(() => ({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi there! I need to gather some basic information.',
      },
    ],
    append: vi.fn(),
    isLoading: false,
  })),
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className} data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={className} data-testid="card-title">
      {children}
    </h3>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} data-testid="button">
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, disabled, className }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      data-testid="input"
    />
  ),
}))

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => (
    <div className={className} data-testid="scroll-area">
      {children}
    </div>
  ),
}))

vi.mock('lucide-react', () => ({
  Send: () => <span data-testid="send-icon">Send</span>,
  Loader2: () => <span data-testid="loader-icon">Loading</span>,
}))

describe('SimpleOnboardingChat', () => {
  const mockOnComplete = vi.fn()
  const mockUserProfile = {
    firstName: 'John',
    lastName: 'Doe',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the chat interface', () => {
    render(
      <SimpleOnboardingChat
        userProfile={mockUserProfile}
        onComplete={mockOnComplete}
        userId="test-user-id"
      />
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toHaveTextContent('Nutrition AI Assistant')
    expect(screen.getByTestId('input')).toBeInTheDocument()
    expect(screen.getByTestId('button')).toBeInTheDocument()
  })

  it('displays initial welcome message', () => {
    render(
      <SimpleOnboardingChat
        userProfile={mockUserProfile}
        onComplete={mockOnComplete}
        userId="test-user-id"
      />
    )

    expect(screen.getByText('Hi there! I need to gather some basic information.')).toBeInTheDocument()
  })

  it('handles user input submission', async () => {
    const mockAppend = vi.fn()
    const { useChat } = await import('@ai-sdk/react')
    
    vi.mocked(useChat).mockReturnValue({
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hi there! I need to gather some basic information.',
        },
      ],
      append: mockAppend,
      isLoading: false,
    } as any)

    render(
      <SimpleOnboardingChat
        userProfile={mockUserProfile}
        onComplete={mockOnComplete}
        userId="test-user-id"
      />
    )

    const input = screen.getByTestId('input')
    const button = screen.getByTestId('button')

    fireEvent.change(input, { target: { value: 'I am 25 years old' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: 'I am 25 years old',
      })
    })
  })

  it('prevents submission with empty input', () => {
    const mockAppend = vi.fn()
    const { useChat } = require('@ai-sdk/react')
    
    useChat.mockReturnValue({
      messages: [],
      append: mockAppend,
      isLoading: false,
    })

    render(
      <SimpleOnboardingChat
        userProfile={mockUserProfile}
        onComplete={mockOnComplete}
        userId="test-user-id"
      />
    )

    const button = screen.getByTestId('button')
    fireEvent.click(button)

    expect(mockAppend).not.toHaveBeenCalled()
  })

  it('shows loading state', () => {
    const { useChat } = require('@ai-sdk/react')
    
    useChat.mockReturnValue({
      messages: [],
      append: vi.fn(),
      isLoading: true,
    })

    render(
      <SimpleOnboardingChat
        userProfile={mockUserProfile}
        onComplete={mockOnComplete}
        userId="test-user-id"
      />
    )

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
  })

  it('handles onboarding completion', async () => {
    const mockProfile = {
      name: 'John Doe',
      age: 25,
      sex: 'male' as const,
      height: 70,
      weight: 180,
      activityLevel: 'moderate' as const,
      goals: ['lose weight'],
      healthConditions: [],
      dietaryRestrictions: ['vegetarian'],
    }

    const { useChat } = require('@ai-sdk/react')
    
    useChat.mockReturnValue({
      messages: [],
      append: vi.fn(),
      isLoading: false,
      onFinish: vi.fn(),
    })

    render(
      <SimpleOnboardingChat
        userProfile={mockUserProfile}
        onComplete={mockOnComplete}
        userId="test-user-id"
      />
    )

    // Simulate the onFinish callback being called
    const onFinishCallback = useChat.mock.calls[0][0].onFinish
    const mockMessage = {
      content: `ONBOARDING_COMPLETE:${JSON.stringify(mockProfile)}`,
    }

    onFinishCallback(mockMessage)

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(mockProfile)
    })
  })
})