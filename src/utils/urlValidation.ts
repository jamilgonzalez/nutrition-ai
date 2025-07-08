/**
 * Validates if a URL is safe to open
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is safe
 */
export const isUrlSafe = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    
    // Block potentially malicious URLs
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '[::1]',
      'internal',
      'local',
    ]
    
    const hostname = parsedUrl.hostname.toLowerCase()
    
    // Check for blocked hosts
    if (blockedHosts.some(blocked => hostname.includes(blocked))) {
      return false
    }
    
    // Check for IP addresses (basic check)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (ipRegex.test(hostname)) {
      return false
    }
    
    return true
  } catch (error) {
    // Invalid URL
    return false
  }
}

/**
 * Safely opens an external URL
 * @param url - The URL to open
 * @returns boolean indicating if the URL was opened
 */
export const openExternalUrl = (url: string): boolean => {
  if (!isUrlSafe(url)) {
    console.warn('Attempted to open potentially unsafe URL:', url)
    return false
  }
  
  try {
    window.open(url, '_blank', 'noopener,noreferrer')
    return true
  } catch (error) {
    console.error('Failed to open URL:', error)
    return false
  }
}

/**
 * Gets a safe favicon URL for a domain
 * @param url - The URL to get favicon for
 * @returns string favicon URL or fallback
 */
export const getSafeFaviconUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url)
    const domain = parsedUrl.hostname
    
    // Only use Google favicon service for safe domains
    if (isUrlSafe(url)) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
    }
    
    return '' // Return empty string for unsafe URLs
  } catch (error) {
    return ''
  }
}