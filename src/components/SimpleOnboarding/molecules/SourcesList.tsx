import { SourceLink } from '../atoms/SourceLink'
import { GeneratedPlan } from '@/types/onboarding'

interface SourcesListProps {
  sources: GeneratedPlan['sources']
  className?: string
}

export function SourcesList({
  sources,
  className = ''
}: SourcesListProps) {
  if (!sources || sources.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Sources & References
      </h3>
      
      <div className="space-y-2">
        {sources.map((source, index) => (
          <SourceLink
            key={index}
            title={source.title}
            url={source.url}
            domain={source.domain}
            relevance={source.relevance}
          />
        ))}
      </div>
      
      <p className="text-xs text-gray-500">
        These sources were used to generate your personalized nutrition plan. 
        Click the links to learn more about the science behind your recommendations.
      </p>
    </div>
  )
}