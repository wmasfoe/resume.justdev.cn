import type { IChatProvider, ProviderCapabilities, ProviderName } from './types'
import { DifyProvider } from './dify'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'

const resolveProvider = (): ProviderName => {
  const raw = (process.env.LLM_PROVIDER || 'dify').toLowerCase()
  if (raw === 'openai' || raw === 'anthropic') return raw
  return 'dify'
}

let cached: IChatProvider | null = null

export function getProvider(): IChatProvider {
  if (cached) return cached
  switch (resolveProvider()) {
    case 'openai':
      cached = new OpenAIProvider()
      break
    case 'anthropic':
      cached = new AnthropicProvider()
      break
    case 'dify':
    default:
      cached = new DifyProvider()
      break
  }
  return cached
}

export function getProviderName(): ProviderName {
  return getProvider().name
}

export function getProviderCapabilities(): ProviderCapabilities {
  return getProvider().capabilities
}
