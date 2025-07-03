'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function FloatingActionButton() {
  const router = useRouter()

  const handleRecordMeal = () => {
    router.push('/record-meal')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <Button
        onClick={handleRecordMeal}
        className="rounded-full w-14 h-14 shadow-lg bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center"
        size="sm"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  )
}
