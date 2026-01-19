import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    let privateKey = process.env.GOOGLE_PRIVATE_KEY

    if (!serviceAccountEmail || !privateKey) {
      return NextResponse.json({
        error: 'Credentials missing',
        hasServiceAccountEmail: !!serviceAccountEmail,
        hasPrivateKey: !!privateKey,
      }, { status: 400 })
    }

    // Private key'i parse et
    privateKey = privateKey.trim()
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1)
    }
    privateKey = privateKey.replace(/\\\\n/g, '\n')
    privateKey = privateKey.replace(/\\n/g, '\n')
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.split('\\n').join('\n')
    }

    // JWT auth oluşturmayı dene
    try {
      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      })

      // Test için bir token almayı dene
      const token = await auth.getAccessToken()
      
      return NextResponse.json({
        success: true,
        message: 'Private key is valid and authentication works!',
        hasToken: !!token,
        keyPreview: privateKey.substring(0, 50) + '...',
        keyLength: privateKey.length,
        newlineCount: (privateKey.match(/\n/g) || []).length,
      })
    } catch (authError: any) {
      return NextResponse.json({
        success: false,
        error: authError.message,
        errorCode: authError.code,
        errorStack: authError.stack,
        keyPreview: privateKey.substring(0, 100),
        keyLength: privateKey.length,
        hasBeginMarker: privateKey.includes('BEGIN PRIVATE KEY'),
        hasEndMarker: privateKey.includes('END PRIVATE KEY'),
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
