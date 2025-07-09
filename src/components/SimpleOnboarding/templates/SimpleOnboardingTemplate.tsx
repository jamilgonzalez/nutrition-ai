interface SimpleOnboardingTemplateProps {
  children: React.ReactNode
  className?: string
}

export function SimpleOnboardingTemplate({
  children,
  className = ''
}: SimpleOnboardingTemplateProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {children}
    </div>
  )
}