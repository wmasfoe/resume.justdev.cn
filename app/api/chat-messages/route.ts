import { type NextRequest } from 'next/server'
import { getInfo } from '@/app/api/utils/common'
import { originGuard } from '@/app/api/utils/origin'
import { getProvider } from '@/app/api/providers/factory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const denied = originGuard(request)
  if (denied) return denied

  const body = await request.json()
  const {
    inputs = {},
    query,
    files,
    conversation_id: conversationId,
    messages,
  } = body
  try {
    const { user } = getInfo(request)
    const provider = getProvider()
    return await provider.chat({
      inputs,
      query,
      user,
      files,
      conversationId,
      messages,
      signal: request.signal,
    })
  }
  catch (e: any) {
    console.error('chat-messages error:', e)
    return new Response(e?.message || 'Server Error', {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
