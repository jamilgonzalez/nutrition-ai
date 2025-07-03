import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface ModelInfo {
  provider: string
  quality: string
  speed: string
  cost: string
}

// Enhanced TTS with multiple model options via OpenRouter
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'No API key configured. Please set OPENROUTER_API_KEY or OPENAI_API_KEY',
        },
        { status: 500 }
      )
    }

    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(text)
    } else {
      return NextResponse.json(
        {
          error:
            'No API key configured. Please set OPENAI_API_KEY for TTS functionality.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Enhanced TTS error:', error)

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

async function generateWithOpenAI(text: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'sage',
    input: text,
    response_format: 'wav',
    speed: 1.0,
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
      'X-Model-Used': 'tts-1',
      'X-Provider': 'OpenAI Direct',
    },
  })
}

// GET endpoint to list available models
export async function GET() {
  const models = {
    'openai/tts-1': {
      name: 'OpenAI TTS-1 (Standard)',
      provider: 'OpenAI',
      quality: 'standard',
      speed: 'fast',
      cost: 'low',
      voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    },
    'openai/tts-1-hd': {
      name: 'OpenAI TTS-1-HD (High Quality)',
      provider: 'OpenAI',
      quality: 'high',
      speed: 'medium',
      cost: 'medium',
      voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    },
  }

  return NextResponse.json({
    models,
    default: 'openai/tts-1',
    recommended: 'openai/tts-1-hd',
  })
}
