import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo } from '@/app/api/utils/common'
import { originGuard } from '@/app/api/utils/origin'
import { getProvider } from '@/app/api/providers/factory'

export async function POST(request: NextRequest, { params }: {
  params: { conversationId: string }
}) {
  const denied = originGuard(request)
  if (denied) return denied

  const provider = getProvider()
  if (!provider.capabilities.conversationList || !provider.renameConversation) {
    return NextResponse.json({ result: 'success' })
  }
  const body = await request.json()
  const { auto_generate, name } = body
  const { conversationId } = params
  const { user } = getInfo(request)
  try {
    const data = await provider.renameConversation(conversationId, name, user, auto_generate)
    return NextResponse.json(data)
  }
  catch (e: any) {
    return NextResponse.json({ result: 'success', error: e?.message })
  }
}
