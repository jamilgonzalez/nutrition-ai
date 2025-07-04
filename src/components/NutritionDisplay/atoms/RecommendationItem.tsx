interface RecommendationItemProps {
  text: string
}

export default function RecommendationItem({ text }: RecommendationItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  )
}