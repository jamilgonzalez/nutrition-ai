import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import RecommendationsList from '../molecules/RecommendationsList'

interface RecommendationsCardProps {
  recommendations: string[]
}

export default function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Nutritional Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RecommendationsList recommendations={recommendations} />
      </CardContent>
    </Card>
  )
}