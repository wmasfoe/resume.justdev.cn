import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo } from '@/app/api/utils/common'
import { originGuard } from '@/app/api/utils/origin'
import { getProvider } from '@/app/api/providers/factory'

export async function POST(request: NextRequest, { params }: {
  params: { messageId: string }
}) {
  const denied = originGuard(request)
  if (denied) return denied

  const provider = getProvider()
  if (!provider.capabilities.feedback || !provider.feedback) {
    return NextResponse.json({ result: 'success' })
  }
  const body = await request.json()
  const { rating } = body
  const { messageId } = params
  const { user } = getInfo(request)
  try {
    const data = await provider.feedback(messageId, rating, user)
    return NextResponse.json(data)
  }
  catch (e: any) {
    return NextResponse.json({ result: 'success', error: e?.message })
  }
}
