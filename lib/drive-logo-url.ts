/**
 * Google Drive "view" veya "preview" linkini doğrudan görsel URL'ine çevirir.
 * drive.google.com/file/d/FILE_ID/view veya /preview → uc?export=view&id=FILE_ID
 */
const DRIVE_VIEW_REGEX = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(view|preview)(\?.*)?$/i

export function toDirectDriveImageUrl(url: string): string {
  const trimmed = (url ?? '').trim()
  if (!trimmed) return trimmed
  const match = trimmed.match(DRIVE_VIEW_REGEX)
  if (match) {
    const fileId = match[1]
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }
  return trimmed
}
