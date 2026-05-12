import type { NextRequest } from 'next/server'

const parseAllowList = (): string[] => {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map((entry) => {
      try { return new URL(entry).host }
      catch { return entry }
    })
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const host = request.headers.get('host')
  if (!host) return false

  const allowList = parseAllowList()

  const check = (urlStr: string | null): boolean => {
    if (!urlStr) return false
    try {
      const h = new URL(urlStr).host
      return h === host || allowList.includes(h)
    }
    catch { return false }
  }

  const origin = request.headers.get('origin')
  if (origin) return check(origin)

  const referer = request.headers.get('referer')
  if (referer) return check(referer)

  return false
}

export function originGuard(request: NextRequest): Response | null {
  if (isSameOriginRequest(request)) return null
  return new Response('Forbidden', { status: 403 })
}
