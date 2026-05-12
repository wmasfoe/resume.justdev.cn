import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo, setSession } from '@/app/api/utils/common'
import { originGuard } from '@/app/api/utils/origin'
import { getProvider } from '@/app/api/providers/factory'
import { DEFAULT_OPENING_STATEMENT } from '@/config'

const FALLBACK_PARAMETERS = {
  opening_statement: DEFAULT_OPENING_STATEMENT,
  user_input_form: [] as any[],
  file_upload: { image: { enabled: false, number_limits: 0, detail: 'low', transfer_methods: [] as string[] } },
  system_parameters: {} as Record<string, any>,
}

export async function GET(request: NextRequest) {
  const denied = originGuard(request)
  if (denied) return denied

  const { sessionId, user } = getInfo(request)
  const provider = getProvider()

  const buildResponse = (data: Record<string, any>) => NextResponse.json({
    ...data,
    capabilities: provider.capabilities,
    provider: provider.name,
  }, { headers: setSession(sessionId) })

  if (!provider.capabilities.appParameters || !provider.getAppParameters) {
    return buildResponse(FALLBACK_PARAMETERS)
  }
  try {
    const data = await provider.getAppParameters(user)
    return buildResponse(data || FALLBACK_PARAMETERS)
  }
  catch {
    return buildResponse(FALLBACK_PARAMETERS)
  }
}
