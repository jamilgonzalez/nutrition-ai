import Image from 'next/image'

interface MealImageProps {
  src: string
  alt: string
}

export default function MealImage({ src, alt }: MealImageProps) {
  return (
    <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  )
}