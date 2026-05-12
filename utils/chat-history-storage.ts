import type { ChatItem } from '@/types/app'

const KEY_PREFIX = 'chat_history:'

const buildKey = (provider: string) => `${KEY_PREFIX}${provider}`

export function loadChatHistory(provider: string): ChatItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(buildKey(provider))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as ChatItem[] : []
  }
  catch {
    return []
  }
}

export function saveChatHistory(provider: string, items: ChatItem[]): void {
  if (typeof window === 'undefined') return
  try {
    const persistable = items.filter(item => !item.isOpeningStatement && !item.feedbackDisabled && (item.content || '').length > 0)
    window.localStorage.setItem(buildKey(provider), JSON.stringify(persistable))
  }
  catch {}
}

export function clearChatHistory(provider: string): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.removeItem(buildKey(provider)) } catch {}
}
