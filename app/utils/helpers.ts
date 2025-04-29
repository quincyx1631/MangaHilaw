/**
 * Formats a date string to a more readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/**
 * Gets the cover image URL from the b2key
 */
export function getCoverImageUrl(b2key: string): string {
  return `${process.env.NEXT_PUBLIC_IMG_URL}/${b2key}`
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Gets status text based on status code
 */
export function getStatusText(statusCode: number): string {
  switch (statusCode) {
    case 1:
      return "Ongoing"
    case 2:
      return "Completed"
    case 3:
      return "Cancelled"
    case 4:
      return "Hiatus"
    default:
      return "Unknown"
  }
}

/**
 * Gets status color class based on status code
 */
export function getStatusColorClass(statusCode: number, isBg = false): string {
  const prefix = isBg ? "bg-" : "text-"

  switch (statusCode) {
    case 1:
      return `${prefix}blue-500`
    case 2:
      return `${prefix}green-500`
    case 3:
      return `${prefix}red-500`
    case 4:
      return `${prefix}amber-500`
    default:
      return `${prefix}gray-500`
  }
}
