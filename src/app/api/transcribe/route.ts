import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let openai: any = null

// Initialize OpenAI directly for transcription
// Note: OpenRouter doesn't support Whisper transcription endpoints
if (process.env.OPENAI_API_KEY) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const OpenAI = require('openai')

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
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
        {
          error:
            'OpenAI API key required for transcription. Please set OPENAI_API_KEY environment variable.',
        },
        { status: 500 }
      )
    }

    // Convert the File to a format OpenAI can accept
    const buffer = await audioFile.arrayBuffer()
    const file = new File([buffer], 'audio.webm', { type: audioFile.type })

    // Transcribe using Whisper via OpenAI directly
    // Note: OpenRouter doesn't support transcription endpoints
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1', // OpenAI's Whisper model
      language: 'en',
      response_format: 'json',
      temperature: 0.2, // Lower temperature for more consistent results
    })

    return NextResponse.json({
      text: transcription.text,
      timestamp: new Date().toISOString(),
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

      if (
        error.message.includes('405') ||
        error.message.includes('Method Not Allowed')
      ) {
        return NextResponse.json(
          {
            error:
              'Transcription service not available. Please ensure you have a valid OpenAI API key configured.',
          },
          { status: 503 }
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
