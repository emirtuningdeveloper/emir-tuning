import { NextResponse } from 'next/server'

export async function GET() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  // Private key'i parse et (lib/google-drive.ts ile aynı mantık)
  let parsedKey = privateKey || ''
  parsedKey = parsedKey.trim()
  
  if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
    parsedKey = parsedKey.slice(1, -1)
  }
  if (parsedKey.startsWith("'") && parsedKey.endsWith("'")) {
    parsedKey = parsedKey.slice(1, -1)
  }
  
  // Tüm olası formatları dene
  parsedKey = parsedKey.replace(/\\\\n/g, '\n')
  parsedKey = parsedKey.replace(/\\n/g, '\n')
  
  // Eğer hala literal \n varsa
  if (parsedKey.includes('\\n')) {
    parsedKey = parsedKey.split('\\n').join('\n')
  }

  // Daha detaylı analiz
  const literalNewlineCount = (parsedKey.match(/\\n/g) || []).length
  const realNewlineCount = (parsedKey.match(/\n/g) || []).length
  const firstNewlineIndex = parsedKey.indexOf('\n')
  const firstLiteralNewlineIndex = parsedKey.indexOf('\\n')
  
  return NextResponse.json({
    hasServiceAccountEmail: !!serviceAccountEmail,
    hasPrivateKey: !!privateKey,
    hasFolderId: !!folderId,
    privateKeyLength: privateKey?.length || 0,
    parsedKeyLength: parsedKey.length,
    privateKeyStartsWith: privateKey?.substring(0, 50).replace(/\n/g, '\\n') || 'N/A',
    parsedKeyStartsWith: parsedKey.substring(0, 50).replace(/\n/g, '\\n'),
    hasBeginMarker: parsedKey.includes('BEGIN PRIVATE KEY'),
    hasEndMarker: parsedKey.includes('END PRIVATE KEY'),
    realNewlineCount: realNewlineCount,
    literalNewlineCount: literalNewlineCount,
    firstNewlineIndex: firstNewlineIndex,
    firstLiteralNewlineIndex: firstLiteralNewlineIndex,
    needsParsing: literalNewlineCount > 0 && realNewlineCount < literalNewlineCount,
  })
}
