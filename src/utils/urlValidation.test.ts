import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isUrlSafe, openExternalUrl, getSafeFaviconUrl } from './urlValidation'

// Mock window.open
const mockWindowOpen = vi.fn()
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
})

// Mock console methods
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('urlValidation utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isUrlSafe', () => {
    it('allows safe HTTPS URLs', () => {
      expect(isUrlSafe('https://example.com')).toBe(true)
      expect(isUrlSafe('https://www.google.com')).toBe(true)
      expect(isUrlSafe('https://api.example.com/data')).toBe(true)
    })

    it('allows safe HTTP URLs', () => {
      expect(isUrlSafe('http://example.com')).toBe(true)
    })

    it('blocks non-HTTP protocols', () => {
      expect(isUrlSafe('ftp://example.com')).toBe(false)
      expect(isUrlSafe('file:///etc/passwd')).toBe(false)
      expect(isUrlSafe('javascript:alert(1)')).toBe(false)
      expect(isUrlSafe('data:text/html,<script>alert(1)</script>')).toBe(false)
    })

    it('blocks localhost and local addresses', () => {
      expect(isUrlSafe('http://localhost:3000')).toBe(false)
      expect(isUrlSafe('http://127.0.0.1:8080')).toBe(false)
      expect(isUrlSafe('http://0.0.0.0')).toBe(false)
      expect(isUrlSafe('http://[::1]')).toBe(false)
      expect(isUrlSafe('http://internal.company.com')).toBe(false)
      expect(isUrlSafe('http://local.dev')).toBe(false)
    })

    it('blocks IP addresses', () => {
      expect(isUrlSafe('http://192.168.1.1')).toBe(false)
      expect(isUrlSafe('http://10.0.0.1')).toBe(false)
      expect(isUrlSafe('http://172.16.0.1')).toBe(false)
    })

    it('handles invalid URLs', () => {
      expect(isUrlSafe('not-a-url')).toBe(false)
      expect(isUrlSafe('')).toBe(false)
      expect(isUrlSafe('invalid:///')).toBe(false)
    })
  })

  describe('openExternalUrl', () => {
    it('opens safe URLs', () => {
      const safeUrl = 'https://example.com'
      const result = openExternalUrl(safeUrl)

      expect(result).toBe(true)
      expect(mockWindowOpen).toHaveBeenCalledWith(safeUrl, '_blank', 'noopener,noreferrer')
    })

    it('blocks unsafe URLs and logs warning', () => {
      const unsafeUrl = 'javascript:alert(1)'
      const result = openExternalUrl(unsafeUrl)

      expect(result).toBe(false)
      expect(mockWindowOpen).not.toHaveBeenCalled()
      expect(mockConsoleWarn).toHaveBeenCalledWith('Attempted to open potentially unsafe URL:', unsafeUrl)
    })

    it('handles window.open errors', () => {
      mockWindowOpen.mockImplementationOnce(() => {
        throw new Error('Window blocked')
      })

      const result = openExternalUrl('https://example.com')

      expect(result).toBe(false)
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to open URL:', expect.any(Error))
    })
  })

  describe('getSafeFaviconUrl', () => {
    it('returns favicon URL for safe URLs', () => {
      const url = 'https://example.com/page'
      const result = getSafeFaviconUrl(url)

      expect(result).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=16')
    })

    it('returns empty string for unsafe URLs', () => {
      const unsafeUrl = 'javascript:alert(1)'
      const result = getSafeFaviconUrl(unsafeUrl)

      expect(result).toBe('')
    })

    it('returns empty string for invalid URLs', () => {
      const invalidUrl = 'not-a-url'
      const result = getSafeFaviconUrl(invalidUrl)

      expect(result).toBe('')
    })

    it('extracts domain correctly from complex URLs', () => {
      const url = 'https://subdomain.example.com/path/to/resource?param=value#hash'
      const result = getSafeFaviconUrl(url)

      expect(result).toBe('https://www.google.com/s2/favicons?domain=subdomain.example.com&sz=16')
    })
  })
})