import React from 'react'

/**
 * Utility for managing URL.createObjectURL lifecycle
 */
export class ObjectURLManager {
  private static urls: Set<string> = new Set()

  /**
   * Creates an object URL and tracks it for cleanup
   * @param object - Blob or File object
   * @returns Object URL string
   */
  static createObjectURL(object: Blob | File): string {
    const url = URL.createObjectURL(object)
    this.urls.add(url)
    return url
  }

  /**
   * Revokes a specific object URL
   * @param url - Object URL to revoke
   */
  static revokeObjectURL(url: string): void {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url)
      this.urls.delete(url)
    }
  }

  /**
   * Revokes all tracked object URLs
   */
  static revokeAllObjectURLs(): void {
    this.urls.forEach(url => {
      URL.revokeObjectURL(url)
    })
    this.urls.clear()
  }

  /**
   * Gets count of tracked URLs (for debugging)
   */
  static getTrackedUrlCount(): number {
    return this.urls.size
  }
}

/**
 * React hook for managing object URLs with automatic cleanup
 * @param file - File object to create URL for
 * @returns Object URL string or null
 */
export function useObjectURL(file: File | null): string | null {
  const [objectURL, setObjectURL] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (file) {
      const url = ObjectURLManager.createObjectURL(file)
      setObjectURL(url)

      return () => {
        ObjectURLManager.revokeObjectURL(url)
      }
    } else {
      setObjectURL(null)
    }
  }, [file])

  return objectURL
}