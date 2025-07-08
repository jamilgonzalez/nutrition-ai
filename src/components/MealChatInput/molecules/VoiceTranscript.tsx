interface VoiceTranscriptProps {
  transcript: string
}

export function VoiceTranscript({ transcript }: VoiceTranscriptProps) {
  if (!transcript) return null

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-700">{transcript}</p>
    </div>
  )
}