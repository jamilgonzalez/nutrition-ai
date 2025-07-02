'use client'

import { Button } from '@/components/ui/button'
import { useChat } from 'ai/react'
import { useRef, useState, useEffect } from 'react'
import { Mic, Square, BarChart3, Camera, X } from 'lucide-react'
import NutritionDisplay, {
  type NutritionData,
} from '@/components/NutritionDisplay'

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzingStructured, setIsAnalyzingStructured] = useState(false)
  const [showStructuredView, setShowStructuredView] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  const { messages, append, isLoading } = useChat({
    api: '/api/upload',
  })

  // Initialize speech recognition
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onstart = () => {
        setIsListening(true)
      }

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript + ' ')
        }
      }

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
      setSpeechSupported(true)
    } else {
      setSpeechSupported(false)
    }
  }, [])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      })
      setStream(mediaStream)
      setShowCamera(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert(
        'Could not access camera. Please check permissions or try uploading an image instead.'
      )
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to blob and create file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `meal-photo-${Date.now()}.jpg`, {
                type: 'image/jpeg',
              })
              setSelectedImage(file)
              setPreviewUrl(URL.createObjectURL(file))
              stopCamera()
            }
          },
          'image/jpeg',
          0.8
        )
      }
    }
  }

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startRecording = () => {
    if (recognition && !isRecording) {
      setIsRecording(true)
      recognition.start()
    }
  }

  const stopRecording = () => {
    if (recognition && isRecording) {
      setIsRecording(false)
      recognition.stop()
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const clearTranscript = () => {
    setTranscript('')
  }

  const handleSendForAnalysis = async () => {
    if (!selectedImage) return

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          resolve(base64String)
        }
        reader.readAsDataURL(selectedImage)
      })

      // Create content with additional context if transcript exists
      let content =
        'Analyze this meal image and provide detailed nutritional information including estimated calories, protein, carbs, and fat.'

      if (transcript.trim()) {
        content += `\n\nAdditional context from user: "${transcript.trim()}"`
      }

      // Use the AI SDK's append function to send the message
      await append({
        role: 'user',
        content,
        experimental_attachments: [
          {
            name: selectedImage.name,
            contentType: selectedImage.type,
            url: base64Image,
          },
        ],
      })

      // Clear transcript after sending
      setTranscript('')
    } catch (error) {
      console.error('Error processing image:', error)
    }
  }

  const handleGetStructuredAnalysis = async () => {
    if (!selectedImage) return

    setIsAnalyzingStructured(true)
    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          resolve(base64String)
        }
        reader.readAsDataURL(selectedImage)
      })

      // Create content with additional context if transcript exists
      let content =
        'Analyze this meal image and provide detailed nutritional information including estimated calories, protein, carbs, and fat.'

      if (transcript.trim()) {
        content += `\n\nAdditional context from user: "${transcript.trim()}"`
      }

      // Call the API with structured flag
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          structured: true,
          messages: [
            {
              role: 'user',
              content,
              experimental_attachments: [
                {
                  name: selectedImage.name,
                  contentType: selectedImage.type,
                  url: base64Image,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get structured analysis')
      }

      const data = await response.json()
      setNutritionData(data)
      setShowStructuredView(true)

      // Clear transcript after sending
      setTranscript('')
    } catch (error) {
      console.error('Error getting structured analysis:', error)
    } finally {
      setIsAnalyzingStructured(false)
    }
  }

  const handleSaveNutritionEntry = () => {
    // TODO: Implement saving to database/local storage
    console.log('Saving nutrition entry:', nutritionData)
    alert('Nutrition entry saved! (Feature coming soon)')
  }

  // Function to render tool call status within the message content
  const renderMessageContent = (message: any) => {
    console.log(message)
    let content = message.content || ''
    const toolInvocations = message.toolInvocations || []

    // Add tool status information to the content display
    toolInvocations.forEach((tool: any) => {
      if (tool.state === 'call') {
        // Show what the AI is currently doing
        if (tool.toolName === 'webSearch') {
          content += `\n\n🔍 Searching the web for: "${tool.args?.query}"...`
        }
      } else if (tool.state === 'result') {
        // Optionally show completion (you can customize this)
        if (tool.toolName === 'webSearch') {
          content += `\n\n✅ Web search completed.`
        }
      }
    })

    return content
  }

  // Get the latest assistant message for display
  const latestAnalysis = messages
    .filter((msg) => msg.role === 'assistant')
    .pop()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl w-full">
          {!showStructuredView ? (
            <>
              <h2 className="text-3xl font-bold mb-4">Upload a Meal</h2>
              <p className="text-gray-500 mb-8">
                Take a picture of your meal and optionally add voice context to
                get nutritional analysis.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />

              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Selected meal"
                    className="mx-auto max-h-64 rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-4 justify-center mb-6 flex-wrap">
                <Button onClick={handleUploadClick}>
                  {selectedImage ? 'Change Image' : 'Upload Image'}
                </Button>
                <Button
                  onClick={startCamera}
                  variant="outline"
                  disabled={showCamera}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                {selectedImage && (
                  <>
                    <Button
                      onClick={handleSendForAnalysis}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Analyzing...' : 'Quick Analysis'}
                    </Button>
                    <Button
                      onClick={handleGetStructuredAnalysis}
                      disabled={isAnalyzingStructured}
                      variant="outline"
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {isAnalyzingStructured
                        ? 'Analyzing...'
                        : 'Detailed Nutrition'}
                    </Button>
                  </>
                )}
              </div>

              {/* Camera Interface */}
              {showCamera && (
                <div className="mb-6 p-4 bg-black rounded-lg relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Take a Photo</h3>
                    <Button
                      onClick={stopCamera}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={capturePhoto}
                        size="lg"
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Capture Photo
                      </Button>
                    </div>
                  </div>
                  {/* Hidden canvas for photo capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* Speech-to-text section */}
              {speechSupported && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    Add Voice Context (Optional)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Describe your meal, dietary restrictions, or ask specific
                    questions about the nutritional content.
                  </p>

                  <div className="flex gap-2 justify-center mb-4">
                    <Button
                      onClick={toggleRecording}
                      variant={isRecording ? 'destructive' : 'outline'}
                      size="sm"
                      disabled={isLoading}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>

                    {transcript && (
                      <Button
                        onClick={clearTranscript}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {isListening && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="animate-pulse rounded-full h-3 w-3 bg-red-500"></div>
                      <span className="text-sm text-red-600">Listening...</span>
                    </div>
                  )}

                  {transcript && (
                    <div className="mt-4 p-3 bg-white rounded-lg border text-left">
                      <h4 className="font-medium mb-2">Your voice input:</h4>
                      <p className="text-sm text-gray-700">{transcript}</p>
                    </div>
                  )}
                </div>
              )}

              {!speechSupported && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-700">
                    Speech recognition is not supported in your browser. You can
                    still upload images for analysis.
                  </p>
                </div>
              )}

              {latestAnalysis && !showStructuredView && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                  <h3 className="text-lg font-semibold mb-2">
                    Quick Nutritional Analysis
                  </h3>
                  <div className="whitespace-pre-wrap text-sm">
                    {renderMessageContent(latestAnalysis)}
                    {/* Show typing indicator if message is currently streaming */}
                    {isLoading && (
                      <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1">
                        |
                      </span>
                    )}
                  </div>

                  {/* Show active tool calls with loading animation */}
                  {latestAnalysis.toolInvocations?.some(
                    (tool: any) => tool.state === 'call'
                  ) && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-blue-600 font-medium">
                          AI is gathering additional information...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <Button
                  onClick={() => setShowStructuredView(false)}
                  variant="outline"
                >
                  ← Back to Upload
                </Button>
                <h2 className="text-2xl font-bold">Nutrition Analysis</h2>
                <div></div> {/* Spacer for centering */}
              </div>

              {nutritionData && (
                <NutritionDisplay
                  data={nutritionData}
                  onSaveEntry={handleSaveNutritionEntry}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
