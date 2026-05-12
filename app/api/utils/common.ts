import { type NextRequest } from 'next/server'
import { v4 } from 'uuid'

const userPrefix = `user_${process.env.DIFY_APP_ID || 'app'}:`

export const getInfo = (request: NextRequest) => {
  const sessionId = request.cookies.get('session_id')?.value || v4()
  const user = userPrefix + sessionId
  return {
    sessionId,
    user,
  }
}

export const setSession = (sessionId: string) => {
  return { 'Set-Cookie': `session_id=${sessionId}` }
}
