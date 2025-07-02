import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let openai: any = null

// Initialize OpenRouter (which provides access to OpenAI models and others)
if (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const OpenAI = require('openai')
  
  // Prefer OpenRouter for better pricing and model access
  if (process.env.OPENROUTER_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Nutrition AI',
      },
    })
  } else {
    // Fallback to direct OpenAI
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'No API key configured. Please set OPENROUTER_API_KEY or OPENAI_API_KEY' },
        { status: 500 }
      )
    }

    // Convert the File to a format OpenAI can accept
    const buffer = await audioFile.arrayBuffer()
    const file = new File([buffer], 'audio.webm', { type: audioFile.type })

    // Transcribe using Whisper (via OpenRouter or OpenAI)
    // OpenRouter supports whisper-1 model with the same API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1', // Available on both OpenRouter and OpenAI
      language: 'en',
      response_format: 'json',
      temperature: 0.2, // Lower temperature for more consistent results
    })

    return NextResponse.json({
      text: transcription.text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Transcription error:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid file format')) {
        return NextResponse.json(
          { error: 'Invalid audio format. Please try again.' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio. Please try again.' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}