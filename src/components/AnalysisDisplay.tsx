'use client'

interface ToolInvocation {
  state: string
  toolName: string
  args?: { query: string }
}

interface AnalysisMessage {
  content?: string
  toolInvocations?: ToolInvocation[]
}

interface AnalysisDisplayProps {
  message: AnalysisMessage | null
  isLoading: boolean
}

export default function AnalysisDisplay({
  message,
  isLoading,
}: AnalysisDisplayProps) {
  if (!message) {
    return null
  }

  const renderMessageContent = (message: AnalysisMessage) => {
    let content = message.content || ''
    const toolInvocations = message.toolInvocations || []

    toolInvocations.forEach((tool) => {
      if (tool.state === 'call') {
        if (tool.toolName === 'webSearch') {
          content += `\n\n🔍 Searching the web for: "${tool.args?.query}"...`
        }
      } else if (tool.state === 'result') {
        if (tool.toolName === 'webSearch') {
          content += `\n\n✅ Web search completed.`
        }
      }
    })

    return content
  }

  const hasActiveToolCalls = message.toolInvocations?.some(
    (tool) => tool.state === 'call'
  )

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
      <h3 className="text-lg font-semibold mb-2">
        Quick Nutritional Analysis
      </h3>
      <div className="whitespace-pre-wrap text-sm">
        {renderMessageContent(message)}
        {isLoading && (
          <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1">
            |
          </span>
        )}
      </div>

      {hasActiveToolCalls && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-600 font-medium">
              AI is gathering additional information...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}