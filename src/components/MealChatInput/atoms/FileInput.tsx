import { forwardRef } from 'react'

interface FileValidationResult {
  isValid: boolean
  error?: string
}

interface FileInputProps {
  accept: string
  capture?: boolean | "environment" | "user"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onValidationError?: (error: string) => void
  maxFileSize?: number // in bytes
  multiple?: boolean
  disabled?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
  'data-testid'?: string
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function validateFile(file: File, maxSize: number, acceptedTypes: string): FileValidationResult {
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`
    }
  }

  // Check file type
  const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim())
  const isValidType = acceptedTypesArray.some(acceptedType => {
    if (acceptedType.startsWith('.')) {
      return file.name.toLowerCase().endsWith(acceptedType.toLowerCase())
    }
    return file.type.match(acceptedType.replace('*', '.*'))
  })

  if (!isValidType) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported. Accepted types: ${acceptedTypes}`
    }
  }

  return { isValid: true }
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ 
    accept, 
    capture, 
    onChange, 
    onValidationError,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    multiple = false,
    disabled = false,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'data-testid': testId 
  }, ref) => {
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      
      if (files.length === 0) {
        onChange(e)
        return
      }

      // Validate each file
      const validationResults = files.map(file => ({
        file,
        validation: validateFile(file, maxFileSize, accept)
      }))

      // Check if any files are invalid
      const invalidFiles = validationResults.filter(result => !result.validation.isValid)
      
      if (invalidFiles.length > 0) {
        const errorMessage = invalidFiles.map(result => 
          `${result.file.name}: ${result.validation.error}`
        ).join('; ')
        
        if (onValidationError) {
          onValidationError(errorMessage)
        }
        
        // Clear the input
        e.target.value = ''
        return
      }

      // All files are valid, proceed with original onChange
      onChange(e)
    }

    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        capture={capture}
        multiple={multiple}
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
        aria-label={ariaLabel || `Choose ${multiple ? 'files' : 'file'} (${accept})`}
        aria-describedby={ariaDescribedBy}
        data-testid={testId}
      />
    )
  }
)

FileInput.displayName = 'FileInput'

export { FileInput, validateFile, DEFAULT_MAX_FILE_SIZE }
export type { FileInputProps, FileValidationResult }