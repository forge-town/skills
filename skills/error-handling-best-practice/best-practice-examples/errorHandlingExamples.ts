import { TRPCError } from '@trpc/server'

export async function fetchUserProfile(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('[fetchUserProfile] Failed:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch user profile',
      cause: error,
    })
  }
}

export async function parseConfig(raw: string) {
  try {
    return JSON.parse(raw)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid JSON format',
        cause: error,
      })
    }
    throw error
  }
}

export async function sendNotification(userId: string, message: string) {
  try {
    await notificationService.send(userId, message)
  } catch (error) {
    console.warn('[sendNotification] Non-critical failure:', error)
  }
}

declare const notificationService: { send: (id: string, msg: string) => Promise<void> }
