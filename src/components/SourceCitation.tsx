'use client'

interface Source {
  title: string
  url: string
  domain: string
  snippet?: string
  relevance: 'high' | 'medium' | 'low'
}

interface SourceCitationProps {
  sources: Source[]
}

export default function SourceCitation({ sources }: SourceCitationProps) {
  console.log('SourceCitation received sources:', sources)
  
  if (!sources || sources.length === 0) {
    console.log('No sources to display')
    return null
  }

  // Sort sources by relevance (high first)
  const sortedSources = sources.sort((a, b) => {
    const relevanceOrder = { high: 0, medium: 1, low: 2 }
    return relevanceOrder[a.relevance] - relevanceOrder[b.relevance]
  })

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span className="text-sm font-medium text-gray-700">Sources</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {sortedSources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            title={source.title}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=16`}
              alt={`${source.domain} icon`}
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="font-medium text-gray-700">{source.domain}</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}