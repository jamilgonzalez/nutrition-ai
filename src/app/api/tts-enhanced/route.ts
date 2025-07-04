import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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
    voice: 'nova',
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
