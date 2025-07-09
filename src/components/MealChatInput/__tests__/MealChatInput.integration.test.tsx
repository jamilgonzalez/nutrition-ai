import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MealChatInput from '../MealChatInput'
import { describe, it, beforeEach, expect, vi } from 'vitest'

// Simple mock implementations
const mockAnalyzeMeal = vi.fn()
const mockCancelAnalysis = vi.fn()

vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    isRecording: false,
    transcript: '',
    speechSupported: true,
    toggleRecording: vi.fn(),
    clearTranscript: vi.fn(),
  }),
}))

let mockSelectedImage: File | null = null
let mockPreviewUrl: string | null = null
const mockHandleImageChange = vi.fn((file: File | null) => {
  mockSelectedImage = file
  mockPreviewUrl = file ? 'blob:mock-url' : null
})

vi.mock('@/hooks/useImageUpload', () => ({
  useImageUpload: () => ({
    selectedImage: mockSelectedImage,
    previewUrl: mockPreviewUrl,
    handleImageChange: mockHandleImageChange,
    convertToBase64: vi
      .fn()
      .mockResolvedValue('data:image/jpeg;base64,mock-base64'),
  }),
}))

vi.mock('@/hooks/useStreamingMealAnalysis', async () => {
  const actual = (await vi.importActual(
    '@/hooks/useStreamingMealAnalysis'
  )) as any
  return {
    ...actual,
    useStreamingMealAnalysis: () => ({
      analyzeMeal: mockAnalyzeMeal,
      isLoading: false,
      loadingState: actual.LoadingState.IDLE,
      currentMessage: { primary: '', secondary: '' },
      cancelAnalysis: mockCancelAnalysis,
    }),
  }
})

vi.mock('@/lib/mealStorage', () => ({
  saveMeal: vi.fn(),
}))

vi.mock('@/utils/memoryManagement', () => ({
  ObjectURLManager: {
    createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
  },
}))

describe('MealChatInput Integration', () => {
  const mockOnMealSaved = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectedImage = null
    mockPreviewUrl = null
    mockAnalyzeMeal.mockResolvedValue({
      data: {
        mealName: 'Test Meal',
        totalCalories: 500,
        macros: { protein: 20, carbohydrates: 60, fat: 15 },
      },
      error: null,
    })
  })

  it('renders input form initially', () => {
    render(<MealChatInput onMealSaved={mockOnMealSaved} />)

    expect(
      screen.getByPlaceholderText('Describe your meal...')
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('submits meal analysis with text input', async () => {
    render(<MealChatInput onMealSaved={mockOnMealSaved} />)

    const input = screen.getByPlaceholderText('Describe your meal...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'Grilled chicken breast' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockAnalyzeMeal).toHaveBeenCalledWith({
        message: 'Grilled chicken breast',
        image: undefined,
      })
    })
  })

  it('submits meal analysis with image input', async () => {
    render(<MealChatInput onMealSaved={mockOnMealSaved} />)

    const fileInput = screen.getByTestId('camera-file-input')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Wait for the image to be processed and component to expand
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Meal preview' })).toBeInTheDocument()
    })
    
    const input = screen.getByPlaceholderText('Describe your meal...')
    const form = input.closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockAnalyzeMeal).toHaveBeenCalledWith({
        message: '',
        image: file,
      })
    })
  })

  it('prevents submission with empty input', async () => {
    render(<MealChatInput onMealSaved={mockOnMealSaved} />)

    const input = screen.getByPlaceholderText('Describe your meal...')
    const form = input.closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockAnalyzeMeal).not.toHaveBeenCalled()
    })
  })

  it('handles analysis errors gracefully', async () => {
    mockAnalyzeMeal.mockResolvedValue({
      data: null,
      error: 'Failed to analyze meal',
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<MealChatInput onMealSaved={mockOnMealSaved} />)

    const input = screen.getByPlaceholderText('Describe your meal...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'Test meal' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error analyzing meal:',
        'Failed to analyze meal'
      )
    })

    consoleSpy.mockRestore()
  })

  it('calls onMealSaved after successful analysis', async () => {
    render(<MealChatInput onMealSaved={mockOnMealSaved} />)

    const input = screen.getByPlaceholderText('Describe your meal...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'Test meal' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockOnMealSaved).toHaveBeenCalledTimes(1)
    })
  })
})
