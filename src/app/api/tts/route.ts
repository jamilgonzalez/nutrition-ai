import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let openai: any = null

// Initialize OpenAI for TTS (OpenRouter doesn't support TTS endpoints)
if (process.env.OPENAI_API_KEY) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const OpenAI = require('openai')
  
  // Use direct OpenAI for TTS functionality
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'alloy' } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'No API key configured. Please set OPENAI_API_KEY for TTS functionality. (OpenRouter does not currently support TTS endpoints)' },
        { status: 500 }
      )
    }

    // Generate speech using TTS via OpenAI
    // Note: OpenRouter doesn't currently support TTS endpoints
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // OpenAI TTS model
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      response_format: 'mp3',
      speed: 0.9, // Slightly slower for better comprehension
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('TTS error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate speech. Please try again.' },
      { status: 500 }
    )
  }
}