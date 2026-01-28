import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to relative time
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-500'
    case 'failed':
      return 'text-red-500'
    case 'processing':
      return 'text-yellow-500'
    case 'pending':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}

// Get status badge variant
export function getStatusBadge(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'failed':
      return 'destructive'
    case 'processing':
      return 'secondary'
    case 'pending':
      return 'outline'
    default:
      return 'outline'
  }
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Format repo URL to display name
export function formatRepoName(url: string): string {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/)
  if (match) {
    return `${match[1]}/${match[2]}`
  }
  return url
}