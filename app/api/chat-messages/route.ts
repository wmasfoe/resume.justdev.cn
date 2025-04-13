import { type NextRequest } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    inputs = {},
    query,
    files,
    conversation_id: conversationId,
    response_mode: responseMode,
  } = body
  try {
    const { user } = getInfo(request)
    const res = await client.createChatMessage(inputs, query, user, responseMode, conversationId, files)
    console.log('res === ', res)
    return new Response(res.data as any)
  } catch(e: any) {
    console.log('请求发生异常 === ', e)
    return new Response(e.message, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
