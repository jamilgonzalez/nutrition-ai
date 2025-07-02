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
    const {
      text,
      voice = 'nova',
      model = 'openai/tts-1',
    } = await request.json()

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

    // OpenRouter provides access to multiple TTS models
    const availableModels = {
      'openai/tts-1': {
        provider: 'OpenAI',
        quality: 'standard',
        speed: 'fast',
        cost: 'low',
      },
      'openai/tts-1-hd': {
        provider: 'OpenAI',
        quality: 'high',
        speed: 'medium',
        cost: 'medium',
      },
      // Add other TTS models as they become available on OpenRouter
    }

    // Note: OpenRouter doesn't currently support TTS endpoints
    // Fall back to direct OpenAI for TTS functionality
    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(text)
    } else if (process.env.OPENROUTER_API_KEY) {
      // Try OpenRouter first, but it will likely fail for TTS
      try {
        return await generateWithOpenRouter(text, voice, model, availableModels)
      } catch {
        console.log('OpenRouter TTS not available, this is expected')
        return NextResponse.json(
          {
            error:
              'TTS not available. OpenRouter does not currently support TTS endpoints. Please set OPENAI_API_KEY for TTS functionality.',
          },
          { status: 503 }
        )
      }
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

async function generateWithOpenRouter(
  text: string,
  voice: string,
  model: string,
  availableModels: Record<string, ModelInfo>
) {
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer':
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Nutrition AI - Enhanced TTS',
    },
  })

  // Use OpenRouter's model routing
  const mp3 = await openai.audio.speech.create({
    model: model.replace('openai/', ''), // OpenRouter handles the provider prefix
    voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
    input: text,
    response_format: 'mp3',
    speed: 6.0,
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'X-Model-Used': model,
      'X-Provider': availableModels[model]?.provider || 'OpenRouter',
    },
  })
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
