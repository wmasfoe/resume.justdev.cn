export class SSEWriter {
  private encoder = new TextEncoder()
  private closed = false

  constructor(private controller: ReadableStreamDefaultController<Uint8Array>) {}

  emit(data: Record<string, any>): void {
    if (this.closed) return
    try {
      const text = `data: ${JSON.stringify(data)}\n\n`
      this.controller.enqueue(this.encoder.encode(text))
    }
    catch {
      this.closed = true
    }
  }

  emitError(message: string, code: string | number = 500): void {
    this.emit({
      event: 'error',
      status: typeof code === 'number' ? code : 500,
      message,
      code: String(code),
    })
  }

  close(): void {
    if (this.closed) return
    this.closed = true
    try {
      this.controller.close()
    }
    catch {}
  }

  isClosed(): boolean {
    return this.closed
  }
}

export type SSEHandler = (writer: SSEWriter) => Promise<void> | void

export function createSSEResponse(handler: SSEHandler): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const writer = new SSEWriter(controller)
      try {
        await handler(writer)
      }
      catch (e: any) {
        writer.emitError(e?.message || 'Unknown error')
      }
      finally {
        writer.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
