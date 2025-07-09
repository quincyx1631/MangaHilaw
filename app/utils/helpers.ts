
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function getCoverImageUrl(b2key: string): string {
  return `/api/image/${b2key}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

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

export const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return "text-blue-500";
      case 2:
        return "text-green-500";
      case 3:
        return "text-red-500";
      case 4:
        return "text-amber-500";
      default:
        return "text-gray-500";
    }
  }

export const getMangaType = (countryCode: string) => {
    switch (countryCode.toLowerCase()) {
      case "jp":
        return "Manga";
      case "kr":
        return "Manhwa";
      case "cn":
        return "Manhua";
      default:
        return "International";
    }
  }