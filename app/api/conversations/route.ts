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
  if (!provider.capabilities.conversationList || !provider.getConversations) {
    return NextResponse.json({ data: [] }, { headers: setSession(sessionId) })
  }
  try {
    const result = await provider.getConversations(user)
    return NextResponse.json(result, { headers: setSession(sessionId) })
  }
  catch (error: any) {
    return NextResponse.json({ data: [], error: error.message })
  }
}
