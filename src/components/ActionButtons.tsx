'use client'

import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

interface ActionButtonsProps {
  selectedImage: File | null
  isAnalyzing: boolean
  isAnalyzingStructured: boolean
  onQuickAnalysis: () => void
  onStructuredAnalysis: () => void
}

export default function ActionButtons({
  selectedImage,
  isAnalyzing,
  isAnalyzingStructured,
  onQuickAnalysis,
  onStructuredAnalysis,
}: ActionButtonsProps) {
  if (!selectedImage) {
    return null
  }

  return (
    <div className="flex gap-4 justify-center mb-6 flex-wrap">
      <Button
        onClick={onQuickAnalysis}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Quick Analysis'}
      </Button>
      <Button
        onClick={onStructuredAnalysis}
        disabled={isAnalyzingStructured}
        variant="outline"
        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        {isAnalyzingStructured ? 'Analyzing...' : 'Detailed Nutrition'}
      </Button>
    </div>
  )
}