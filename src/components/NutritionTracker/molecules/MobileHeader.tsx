import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function MobileHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm  border-slate-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-800">Nutrition AI</h1>
        </div>
      </div>
    </div>
  )
}
