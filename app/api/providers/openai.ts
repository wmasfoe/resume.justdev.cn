import { v4 } from 'uuid'
import { promptTemplate } from '@/config'
import type { ChatRequest, IChatProvider, ProviderCapabilities } from './types'
import { createSSEResponse, SSEWriter } from './sse'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

export class OpenAIProvider implements IChatProvider {
  readonly name = 'openai' as const
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
    if (!OPENAI_API_KEY) {
      writer.emitError('OPENAI_API_KEY is not configured', 500)
      return
    }

    const messageId = v4()
    const taskId = v4()
    const reasoningId = v4()

    const history = (req.messages || []).filter(m => m.content && m.content.trim().length > 0)
    const messages = [
      { role: 'system', content: promptTemplate },
      ...history,
      { role: 'user', content: req.query },
    ]

    let upstream: Response
    try {
      upstream = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages,
          stream: true,
          stream_options: { include_usage: true },
        }),
        signal: req.signal,
      })
    }
    catch (e: any) {
      writer.emitError(`OpenAI request failed: ${e?.message || e}`, 500)
      return
    }

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '')
      writer.emitError(text || `OpenAI request failed: ${upstream.status}`, upstream.status)
      return
    }

    const reader = upstream.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let usage: any = null

    const dispatchChunk = (chunk: any) => {
      const choice = chunk.choices?.[0]
      if (!choice) {
        if (chunk.usage) usage = chunk.usage
        return
      }
      const delta = choice.delta || {}

      const reasoning = delta.reasoning_content ?? delta.reasoning
      if (typeof reasoning === 'string' && reasoning.length > 0) {
        writer.emit({
          event: 'reasoning_delta',
          id: reasoningId,
          message_id: messageId,
          delta: reasoning,
        })
      }

      if (typeof delta.content === 'string' && delta.content.length > 0) {
        writer.emit({
          event: 'agent_message',
          answer: delta.content,
          id: messageId,
          conversation_id: '',
          task_id: taskId,
        })
      }

      if (chunk.usage) usage = chunk.usage
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const raw of lines) {
          const line = raw.trim()
          if (!line || !line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (!payload || payload === '[DONE]') continue
          let chunk: any
          try {
            chunk = JSON.parse(payload)
          }
          catch {
            continue
          }
          dispatchChunk(chunk)
        }
      }
      if (buffer.trim().startsWith('data:')) {
        const payload = buffer.trim().slice(5).trim()
        if (payload && payload !== '[DONE]') {
          try { dispatchChunk(JSON.parse(payload)) } catch {}
        }
      }
    }
    catch (e: any) {
      writer.emitError(`OpenAI stream error: ${e?.message || e}`, 500)
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
