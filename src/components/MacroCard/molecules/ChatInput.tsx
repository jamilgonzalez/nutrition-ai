'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, Send } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (message: string) => void
  placeholder?: string
}

export default function ChatInput({ 
  onSubmit, 
  placeholder = "Add a meal or ask about nutrition..." 
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim())
      setInputValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-pb">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="pr-20 py-3 text-sm bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400 rounded-lg"
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputValue ? (
              <Button 
                size="sm" 
                className="h-7 w-7 p-0 bg-slate-700 hover:bg-slate-800 rounded-md"
                onClick={handleSubmit}
              >
                <Send className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => {
                  // TODO: Implement voice input
                  console.log('Voice input not implemented yet')
                }}
              >
                <Mic className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}