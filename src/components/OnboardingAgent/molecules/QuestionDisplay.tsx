import { Question } from '../types'

interface QuestionDisplayProps {
  question: Question
  userName: string
  showGreeting: boolean
  currentIndex: number
  totalQuestions: number
}

export function QuestionDisplay({ 
  question, 
  userName, 
  showGreeting, 
  currentIndex, 
  totalQuestions 
}: QuestionDisplayProps) {
  const getQuestionText = () => {
    if (question.type === 'welcome' && typeof question.text === 'function') {
      return question.text(userName)
    }
    return typeof question.text === 'function' ? question.text(userName) : question.text
  }

  const getVoiceText = () => {
    return typeof question.voiceText === 'function' 
      ? question.voiceText(userName) 
      : question.voiceText
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-lg">
          {showGreeting && question.type === 'welcome'
            ? getVoiceText()
            : getQuestionText()}
        </p>
      </div>
      
      <div className="text-sm text-gray-600">
        Question {currentIndex + 1} of {totalQuestions}
      </div>
    </div>
  )
}