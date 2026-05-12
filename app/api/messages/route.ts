import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo, setSession } from '@/app/api/utils/common'
import { originGuard } from '@/app/api/utils/origin'
import { getProvider } from '@/app/api/providers/factory'

export async function GET(request: NextRequest) {
  const denied = originGuard(request)
  if (denied) return denied

  const { sessionId, user } = getInfo(request)
  const provider = getProvider()
  if (!provider.capabilities.conversationList || !provider.getMessages) {
    return NextResponse.json({ data: [] }, { headers: setSession(sessionId) })
  }
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversation_id') || ''
  try {
    const result = await provider.getMessages(user, conversationId)
    return NextResponse.json(result, { headers: setSession(sessionId) })
  }
  catch (e: any) {
    return NextResponse.json({ data: [], error: e?.message }, { headers: setSession(sessionId) })
  }
}
