import type { ChatItem } from '@/types/app'

export type HistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function chatListToMessages(chatList: ChatItem[]): HistoryMessage[] {
  const messages: HistoryMessage[] = []
  for (const item of chatList) {
    if (item.isOpeningStatement || item.feedbackDisabled) continue
    const content = (item.content || '').trim()
    if (!content) continue
    messages.push({
      role: item.isAnswer ? 'assistant' : 'user',
      content,
    })
  }
  return messages
}
