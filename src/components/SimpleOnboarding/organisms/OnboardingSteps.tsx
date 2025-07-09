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
    { key: 'adjusting', label: 'Adjust Plan', number: 4 },
    { key: 'finalizing', label: 'Updating Plan', number: 4 },
    { key: 'complete', label: 'Complete', number: 5 }
  ]

  const currentStepData = steps.find(step => step.key === currentStep)
  const currentStepNumber = currentStepData?.number || 1

  return (
    <div className={`bg-white border-b p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-center mb-2">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm
              ${currentStepNumber === 5 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white'
              }
            `}>
              {currentStepNumber}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              Step {currentStepNumber} of 5
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {currentStepData?.label || 'Welcome'}
            </p>
          </div>
          <div className="mt-3">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  currentStepNumber === 5 ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${(currentStepNumber / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {steps
              .filter((step, index, arr) => 
                arr.findIndex(s => s.number === step.number) === index
              )
              .map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm transition-all duration-200
                      ${step.number <= currentStepNumber 
                        ? step.number === currentStepNumber && currentStepNumber === 5
                          ? 'bg-green-600 text-white shadow-green-200' 
                          : 'bg-blue-600 text-white shadow-blue-200'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {step.number === currentStepNumber && currentStepNumber === 5 ? '✓' : step.number}
                    </div>
                    <span className={`
                      ml-3 text-sm font-medium transition-colors duration-200
                      ${step.number <= currentStepNumber 
                        ? step.number === currentStepNumber && currentStepNumber === 5
                          ? 'text-green-600'
                          : 'text-blue-600'
                        : 'text-gray-500'
                      }
                    `}>
                      {step.label}
                    </span>
                  </div>
                  {index < 4 && (
                    <div className={`
                      w-12 h-0.5 mx-4 transition-colors duration-200
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
    </div>
  )
}