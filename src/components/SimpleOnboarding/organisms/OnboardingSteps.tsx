import { OnboardingFlowState } from '@/types/onboarding'

interface OnboardingStepsProps {
  currentStep: OnboardingFlowState
  className?: string
}

export function OnboardingSteps({
  currentStep,
  className = ''
}: OnboardingStepsProps) {
  const steps = [
    { key: 'greeting', label: 'Welcome', number: 1 },
    { key: 'form', label: 'Your Info', number: 2 },
    { key: 'generating', label: 'Generating', number: 3 },
    { key: 'plan_review', label: 'Review Plan', number: 4 },
    { key: 'adjusting', label: 'Adjusting', number: 4 }, // Same as review
    { key: 'finalizing', label: 'Finalizing', number: 4 }, // Same as review
    { key: 'complete', label: 'Complete', number: 5 }
  ]

  const currentStepData = steps.find(step => step.key === currentStep)
  const currentStepNumber = currentStepData?.number || 1

  return (
    <div className={`bg-white border-b p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps
            .filter((step, index, arr) => 
              arr.findIndex(s => s.number === step.number) === index
            )
            .map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step.number <= currentStepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {step.number}
                  </div>
                  <span className={`
                    ml-2 text-sm font-medium
                    ${step.number <= currentStepNumber 
                      ? 'text-blue-600' 
                      : 'text-gray-500'
                    }
                  `}>
                    {step.label}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`
                    w-12 h-0.5 mx-4
                    ${step.number < currentStepNumber 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200'
                    }
                  `} />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}