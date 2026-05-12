import { type NextRequest } from 'next/server'
import { getInfo } from '@/app/api/utils/common'
import { originGuard } from '@/app/api/utils/origin'
import { getProvider } from '@/app/api/providers/factory'

export async function POST(request: NextRequest) {
  const denied = originGuard(request)
  if (denied) return denied

  const provider = getProvider()
  if (!provider.capabilities.fileUpload || !provider.fileUpload) {
    return new Response('File upload is not supported by current provider', { status: 501 })
  }
  try {
    const formData = await request.formData()
    const { user } = getInfo(request)
    const res = await provider.fileUpload(formData, user)
    return new Response(res.id as any)
  }
  catch (e: any) {
    return new Response(e.message, { status: 500 })
  }
}
