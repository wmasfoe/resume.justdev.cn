import { v4 } from 'uuid'
import { promptTemplate } from '@/config'
import type { ChatRequest, IChatProvider, ProviderCapabilities } from './types'
import { createSSEResponse, SSEWriter } from './sse'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const ANTHROPIC_BASE_URL = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '')
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-7'
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01'
const ANTHROPIC_MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS || 4096)
const ANTHROPIC_THINKING_BUDGET = Number(process.env.ANTHROPIC_THINKING_BUDGET || 0)

export class AnthropicProvider implements IChatProvider {
  readonly name = 'anthropic' as const
  readonly capabilities: ProviderCapabilities = {
    conversationList: false,
    fileUpload: false,
    feedback: false,
    appParameters: false,
  }

  async chat(req: ChatRequest): Promise<Response> {
    return createSSEResponse(async (writer) => {
      await this.stream(req, writer)
    })
  }

  private async stream(req: ChatRequest, writer: SSEWriter) {
    if (!ANTHROPIC_API_KEY) {
      writer.emitError('ANTHROPIC_API_KEY is not configured', 500)
      return
    }

    const messageId = v4()
    const taskId = v4()
    const reasoningId = v4()

    const history = (req.messages || []).filter(m => m.content && m.content.trim().length > 0)
    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: req.query },
    ]

    const thinkingEnabled = ANTHROPIC_THINKING_BUDGET > 0
    const maxTokens = thinkingEnabled
      ? Math.max(ANTHROPIC_MAX_TOKENS, ANTHROPIC_THINKING_BUDGET + 1024)
      : ANTHROPIC_MAX_TOKENS

    const body: Record<string, any> = {
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system: promptTemplate,
      messages,
      stream: true,
    }
    if (thinkingEnabled) {
      body.thinking = { type: 'enabled', budget_tokens: ANTHROPIC_THINKING_BUDGET }
    }

    let upstream: Response
    try {
      upstream = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify(body),
        signal: req.signal,
      })
    }
    catch (e: any) {
      writer.emitError(`Anthropic request failed: ${e?.message || e}`, 500)
      return
    }

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '')
      writer.emitError(text || `Anthropic request failed: ${upstream.status}`, upstream.status)
      return
    }

    const reader = upstream.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let usage: any = null

    const handleEvent = (eventType: string, dataLine: string) => {
      let payload: any
      try {
        payload = JSON.parse(dataLine)
      }
      catch {
        return
      }
      if (eventType === 'content_block_delta') {
        const delta = payload.delta
        if (!delta) return
        if (delta.type === 'thinking_delta' && typeof delta.thinking === 'string') {
          writer.emit({
            event: 'reasoning_delta',
            id: reasoningId,
            message_id: messageId,
            delta: delta.thinking,
          })
        }
        else if (delta.type === 'text_delta' && typeof delta.text === 'string') {
          writer.emit({
            event: 'agent_message',
            answer: delta.text,
            id: messageId,
            conversation_id: '',
            task_id: taskId,
          })
        }
      }
      else if (eventType === 'message_delta') {
        if (payload.usage) usage = { ...(usage || {}), ...payload.usage }
      }
      else if (eventType === 'message_start') {
        if (payload?.message?.usage) usage = payload.message.usage
      }
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let idx: number
        // Anthropic uses double-newline separated events.
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const block = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 2)
          let eventType = ''
          const dataLines: string[] = []
          for (const rawLine of block.split('\n')) {
            const line = rawLine.trim()
            if (!line) continue
            if (line.startsWith('event:')) eventType = line.slice(6).trim()
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
          }
          if (eventType && dataLines.length > 0)
            handleEvent(eventType, dataLines.join('\n'))
        }
      }
    }
    catch (e: any) {
      writer.emitError(`Anthropic stream error: ${e?.message || e}`, 500)
      return
    }

    writer.emit({
      event: 'message_end',
      id: messageId,
      conversation_id: '',
      task_id: taskId,
      metadata: usage ? { usage } : {},
    })
  }
}
