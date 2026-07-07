/** Extract YouTube video ID from common URL formats. */
export function extractYoutubeId(url: string): string {
  if (!url) return ''
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  return match?.[1] ?? ''
}
