/**
 * API çağrılarını loglamak için adapter.
 * Firestore'daki logApiCall ile uyumlu nesne oluşturur.
 */
import { logApiCall as firestoreLogApiCall } from './firestore-admin'

export async function logApiCall(
  apiName: string,
  path: string,
  method: string,
  startTime: number,
  success: boolean,
  statusCode: number,
  error?: string,
  _?: unknown,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const duration = Date.now() - startTime
    await firestoreLogApiCall({
      apiName,
      path,
      method,
      duration,
      success,
      statusCode,
      ...(error != null && { error }),
      ...(metadata != null && { metadata }),
    })
  } catch (err) {
    console.error('Error logging API call:', err)
    // Loglama hatası uygulamayı durdurmamalı
  }
}
