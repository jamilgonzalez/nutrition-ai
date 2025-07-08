import { forwardRef } from 'react'

interface FileInputProps {
  accept: string
  capture?: boolean | "environment" | "user"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ accept, capture, onChange }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        capture={capture}
        onChange={onChange}
        className="hidden"
      />
    )
  }
)

FileInput.displayName = 'FileInput'

export { FileInput }