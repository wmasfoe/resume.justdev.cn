import { ChatClient } from 'dify-client'
import type { ChatRequest, IChatProvider, ProviderCapabilities } from './types'

const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
const DIFY_API_URL = process.env.DIFY_API_URL || ''

const client = new ChatClient(DIFY_API_KEY, DIFY_API_URL || undefined)

export class DifyProvider implements IChatProvider {
  readonly name = 'dify' as const
  readonly capabilities: ProviderCapabilities = {
    conversationList: true,
    fileUpload: true,
    feedback: true,
    appParameters: true,
  }

  async chat(req: ChatRequest): Promise<Response> {
    const { inputs = {}, query, user, files, conversationId } = req
    const res: any = await client.createChatMessage(
      inputs,
      query,
      user,
      true,
      conversationId || undefined,
      files,
    )
    return new Response(res.data as any, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    })
  }

  async getConversations(user: string) {
    const { data }: any = await client.getConversations(user)
    return { data: Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []) }
  }

  async getMessages(user: string, conversationId: string) {
    const { data }: any = await client.getConversationMessages(user, conversationId)
    return { data: Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []) }
  }

  async renameConversation(conversationId: string, name: string, user: string, autoGenerate?: boolean) {
    const { data }: any = await client.renameConversation(conversationId, name, user, autoGenerate)
    return data
  }

  async getAppParameters(user: string) {
    const { data }: any = await client.getApplicationParameters(user)
    return data
  }

  async fileUpload(formData: FormData, user: string) {
    formData.append('user', user)
    const res: any = await client.fileUpload(formData)
    return { id: res.data.id }
  }

  async feedback(messageId: string, rating: string | null, user: string) {
    const { data }: any = await client.messageFeedback(messageId, rating, user)
    return data
  }
}
