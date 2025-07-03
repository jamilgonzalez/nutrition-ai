import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

let openai: OpenAI | null = null

// Initialize OpenAI directly for transcription
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!openai) {
      return NextResponse.json(
        {
          error:
            'OpenAI API key required for transcription. Please set OPENAI_API_KEY environment variable.',
        },
        { status: 500 }
      )
    }

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert the File to a format OpenAI can accept
    const buffer = await audioFile.arrayBuffer()
    const file = new File([buffer], 'audio.webm', { type: audioFile.type })

    // Transcribe using Whisper via OpenAI directly
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
      temperature: 0.2,
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
