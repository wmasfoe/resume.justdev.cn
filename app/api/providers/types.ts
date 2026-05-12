import type { VisionFile } from '@/types/app'

export type ProviderName = 'dify' | 'openai' | 'anthropic'

export type ProviderCapabilities = {
  conversationList: boolean
  fileUpload: boolean
  feedback: boolean
  appParameters: boolean
}

export type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatRequest = {
  query: string
  messages?: HistoryMessage[]
  conversationId?: string | null
  user: string
  files?: VisionFile[]
  inputs?: Record<string, any>
  signal?: AbortSignal
}

export type AppParameters = {
  opening_statement?: string
  user_input_form?: any[]
  file_upload?: {
    image?: {
      enabled: boolean
      number_limits: number
      detail: string
      transfer_methods: string[]
    }
  }
  system_parameters?: Record<string, any>
}

export interface IChatProvider {
  readonly name: ProviderName
  readonly capabilities: ProviderCapabilities

  chat(req: ChatRequest): Promise<Response>

  getConversations?(user: string): Promise<{ data: any[] }>
  getMessages?(user: string, conversationId: string): Promise<{ data: any[] }>
  renameConversation?(conversationId: string, name: string, user: string, autoGenerate?: boolean): Promise<any>

  getAppParameters?(user: string): Promise<AppParameters>
  fileUpload?(form: FormData, user: string): Promise<{ id: string }>
  feedback?(messageId: string, rating: string | null, user: string): Promise<any>
}
