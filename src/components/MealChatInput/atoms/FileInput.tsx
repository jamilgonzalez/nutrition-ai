import { forwardRef } from 'react'

interface FileInputProps {
  accept: string
  capture?: boolean | "environment" | "user"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  'data-testid'?: string
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ accept, capture, onChange, 'data-testid': testId }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        capture={capture}
        onChange={onChange}
        className="hidden"
        data-testid={testId}
      />
    )
  }
)

FileInput.displayName = 'FileInput'

export { FileInput }