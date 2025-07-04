import RecommendationItem from '../atoms/RecommendationItem'

interface RecommendationsListProps {
  recommendations: string[]
}

export default function RecommendationsList({
  recommendations,
}: RecommendationsListProps) {
  return (
    <div className="space-y-3">
      {recommendations.map((recommendation, index) => (
        <RecommendationItem key={index} text={recommendation} />
      ))}
    </div>
  )
}