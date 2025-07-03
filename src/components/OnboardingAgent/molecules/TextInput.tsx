import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Question } from '../types'

interface TextInputProps {
  question: Question
  textInput: string
  onTextInputChange: (value: string) => void
  onSelectChange: (value: string) => void
  onSubmit: () => void
}

export function TextInput({
  question,
  textInput,
  onTextInputChange,
  onSelectChange,
  onSubmit,
}: TextInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit()
    }
  }

  if (question.type === 'select' && question.options) {
    return (
      <Select onValueChange={onSelectChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {question.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="space-y-2">
      <Input
        type={question.type === 'number' ? 'number' : 'text'}
        value={textInput}
        onChange={(e) => onTextInputChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={
          question.type === 'number' ? 'Enter number' : 'Type your answer'
        }
      />
      <Button onClick={onSubmit} className="w-full">
        Next
      </Button>
    </div>
  )
}