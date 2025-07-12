import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}m`
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) {
    return `${count} ${singular}`
  }
  return `${count} ${plural || singular + 's'}`
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) {
    return text
  }
  return text.substring(0, length) + '...'
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export function getDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

export function parseQueryString(query: string): Record<string, string> {
  const params: Record<string, string> = {}
  const pairs = query.slice(1).split('&')
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  }
  
  return params
}

export function buildQueryString(params: Record<string, string | number | boolean>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  
  return query ? `?${query}` : ''
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve()
      } else {
        reject(new Error('Unable to copy to clipboard'))
      }
      document.body.removeChild(textArea)
    })
  }
}

export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

export function formatAddress(lat: number, lng: number): Promise<string> {
  // This would typically use a geocoding service like Google Maps API
  // For now, return a placeholder
  return Promise.resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
}

export function validateForm(data: any, rules: Record<string, any>): string[] {
  const errors: string[] = []
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
      errors.push(`${capitalizeFirst(field)} is required`)
    }
    
    if (rule.min && value && value.length < rule.min) {
      errors.push(`${capitalizeFirst(field)} must be at least ${rule.min} characters`)
    }
    
    if (rule.max && value && value.length > rule.max) {
      errors.push(`${capitalizeFirst(field)} must be no more than ${rule.max} characters`)
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors.push(`${capitalizeFirst(field)} format is invalid`)
    }
    
    if (rule.custom && value) {
      const customError = rule.custom(value)
      if (customError) {
        errors.push(customError)
      }
    }
  }
  
  return errors
} 