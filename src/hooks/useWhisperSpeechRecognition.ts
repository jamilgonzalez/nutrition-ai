'use client'

import { useState, useRef, useCallback } from 'react'

interface UseWhisperSpeechRecognitionReturn {
  isRecording: boolean
  transcript: string
  isProcessing: boolean
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  clearTranscript: () => void
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
}

export function useWhisperSpeechRecognition(): UseWhisperSpeechRecognitionReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setIsRecording(true)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000 // Optimized for Whisper
        } 
      })
      
      streamRef.current = stream

      // Set up audio analysis for visualization
      const context = new AudioContext()
      const source = context.createMediaStreamSource(stream)
      const analyserNode = context.createAnalyser()
      
      analyserNode.fftSize = 512
      analyserNode.smoothingTimeConstant = 0.8
      source.connect(analyserNode)
      
      setAudioContext(context)
      setAnalyser(analyserNode)

      // Set up MediaRecorder for Whisper
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        await processRecording()
      }

      mediaRecorder.start()
      
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to start recording. Please check microphone permissions.')
      setIsRecording(false)
    }
  }, [])

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false)
      setIsProcessing(true)
      mediaRecorderRef.current.stop()
      
      // Clean up audio context
      if (audioContext) {
        await audioContext.close()
        setAudioContext(null)
        setAnalyser(null)
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [isRecording, audioContext])

  const processRecording = async () => {
    try {
      if (audioChunksRef.current.length === 0) {
        setIsProcessing(false)
        return
      }

      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      
      // Convert to the format Whisper expects (we'll send webm and let the server handle conversion)
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('model', 'whisper-1')
      formData.append('language', 'en')
      formData.append('response_format', 'json')

      // Send to our API endpoint that proxies to OpenAI
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.text && result.text.trim()) {
        setTranscript(result.text.trim())
      } else {
        setError('No speech detected. Please try again.')
      }
      
    } catch (err) {
      console.error('Error processing recording:', err)
      setError('Failed to process recording. Please try again.')
    } finally {
      setIsProcessing(false)
      audioChunksRef.current = []
    }
  }

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isRecording,
    transcript,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    audioContext,
    analyser
  }
}