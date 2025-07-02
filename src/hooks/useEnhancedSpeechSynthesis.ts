'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseEnhancedSpeechSynthesisReturn {
  speak: (text: string) => Promise<void>
  stop: () => void
  isSpeaking: boolean
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  progress: number
}

export function useEnhancedSpeechSynthesis(): UseEnhancedSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [progress, setProgress] = useState(0)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(console.warn)
      }
    }
  }, [audioContext])

  const speakWithEnhancedTTS = useCallback(async (text: string) => {
    try {
      // Call our enhanced TTS API endpoint (uses OpenAI)
      // Note: OpenRouter doesn't currently support TTS endpoints
      const response = await fetch('/api/tts-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: 'alloy', // Natural, friendly voice
          model: 'openai/tts-1-hd', // High quality model via OpenAI
        }),
      })

      if (!response.ok) {
        throw new Error(`Enhanced TTS API failed: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create audio element and set up analysis
      const audio = new Audio(audioUrl)
      audioElementRef.current = audio

      // Set up audio context for visualization
      const context = new AudioContext()
      const source = context.createMediaElementSource(audio)
      const analyserNode = context.createAnalyser()

      analyserNode.fftSize = 512
      analyserNode.smoothingTimeConstant = 0.8
      source.connect(analyserNode)
      source.connect(context.destination)

      setAudioContext(context)
      setAnalyser(analyserNode)

      // Set up progress tracking
      const updateProgress = () => {
        if (audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100)
        }
      }

      audio.addEventListener('timeupdate', updateProgress)

      // Play audio
      await audio.play()

      // Wait for audio to finish
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setIsSpeaking(false)
          setProgress(100)
          URL.revokeObjectURL(audioUrl)
          if (context.state !== 'closed') {
            context.close().catch(console.warn)
          }
          setAudioContext(null)
          setAnalyser(null)
          resolve()
        }

        audio.onerror = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
          if (context.state !== 'closed') {
            context.close().catch(console.warn)
          }
          setAudioContext(null)
          setAnalyser(null)
          reject(new Error('Audio playback failed'))
        }
      })
    } catch (error) {
      console.error('Enhanced TTS error:', error)
      setIsSpeaking(false)
      setProgress(0)
      // Clean up any dangling audio context
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(console.warn)
        setAudioContext(null)
        setAnalyser(null)
      }
      throw error
    }
  }, [])

  const speakWithBrowser = useCallback(async (text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Check if speech synthesis is allowed
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel()
        // Wait a bit for cancellation to complete
        setTimeout(() => {
          speakWithBrowser(text).then(resolve).catch(reject)
        }, 100)
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Configure voice settings
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      // Load voices if not available yet
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()
        const preferredVoice =
          voices.find(
            (voice) =>
              voice.name.includes('Natural') ||
              voice.name.includes('Enhanced') ||
              voice.name.includes('Premium')
          ) || voices.find((voice) => voice.lang.startsWith('en'))

        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
      }

      // Try to load voices immediately
      loadVoices()

      // If no voices loaded, wait for them
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', loadVoices, {
          once: true,
        })
      }

      // Track progress (approximate for browser TTS)
      const words = text.split(' ')
      const avgWordsPerSecond = 3
      const estimatedDuration = (words.length / avgWordsPerSecond) * 1000

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 100 / (estimatedDuration / 100)
          return Math.min(newProgress, 95) // Don't reach 100% until actually done
        })
      }, 100)

      utterance.onstart = () => {
        setIsSpeaking(true)
        setProgress(0)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setProgress(100)
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
        resolve()
      }

      utterance.onerror = (event) => {
        setIsSpeaking(false)
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }

        // Handle specific error types
        if (event.error === 'not-allowed') {
          console.warn(
            'Speech synthesis not allowed - user interaction may be required'
          )
          reject(
            new Error(
              'Speech synthesis not allowed. Please interact with the page first or enable audio permissions.'
            )
          )
        } else {
          reject(new Error(`Speech synthesis error: ${event.error}`))
        }
      }

      try {
        speechSynthesis.speak(utterance)
      } catch (error) {
        setIsSpeaking(false)
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
        reject(new Error(`Failed to start speech synthesis: ${error}`))
      }
    })
  }, [])

  const speak = useCallback(
    async (text: string) => {
      try {
        setIsSpeaking(true)
        setProgress(0)

        // For better audio analysis, we'll use OpenAI TTS if available
        // Note: OpenRouter doesn't currently support TTS endpoints
        const useEnhancedTTS =
          typeof window !== 'undefined' &&
          (window.localStorage.getItem('enableEnhancedTTS') === 'true' ||
            process.env.NODE_ENV === 'development')

        if (useEnhancedTTS) {
          await speakWithEnhancedTTS(text)
        } else {
          await speakWithBrowser(text)
        }
      } catch (error) {
        console.error('Speech synthesis error:', error)
        // Fallback to browser speech synthesis
        try {
          await speakWithBrowser(text)
        } catch (fallbackError) {
          console.error('Browser speech synthesis also failed:', fallbackError)
          setIsSpeaking(false)
          setProgress(0)
        }
      }
    },
    [speakWithEnhancedTTS, speakWithBrowser]
  )

  const stop = useCallback(() => {
    if (utteranceRef.current) {
      speechSynthesis.cancel()
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.currentTime = 0
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(console.warn)
      setAudioContext(null)
      setAnalyser(null)
    }

    setIsSpeaking(false)
    setProgress(0)
  }, [audioContext])

  return {
    speak,
    stop,
    isSpeaking,
    audioContext,
    analyser,
    progress,
  }
}
