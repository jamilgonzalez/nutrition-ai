import { ExternalLink } from 'lucide-react'

interface SourceLinkProps {
  title: string
  url: string
  domain: string
  relevance: 'high' | 'medium' | 'low'
  className?: string
}

export function SourceLink({
  title,
  url,
  domain,
  relevance,
  className = ''
}: SourceLinkProps) {
  const relevanceColors = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className={`flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors ${className}`}>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-500">{domain}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full border ${relevanceColors[relevance]}`}>
          {relevance}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}