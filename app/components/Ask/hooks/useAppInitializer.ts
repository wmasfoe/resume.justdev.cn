import { useState, useEffect } from 'react'
import type { PromptConfig, VisionSettings, ConversationItem } from '@/types/app'
import { Resolution, TransferMethod } from '@/types/app'
import { fetchAppParams, fetchConversations } from '@/service'
import { userInputsFormToPromptVariables } from '@/utils/prompt'
import { APP_ID, APP_INFO, promptTemplate } from '@/config'
import Toast from '@/app/components/base/toast'

interface UseAppInitializerProps {
  hasSetAppConfig: boolean
  getConversationIdFromStorage: (appId: string) => string
  setNewConversationInfo: (info: any) => void
  setConversationList: (list: ConversationItem[]) => void
  setCurrConversationId: (id: string, appId: string, isNewConversation: boolean) => void
}

export default function useAppInitializer({
  hasSetAppConfig,
  getConversationIdFromStorage,
  setNewConversationInfo,
  setConversationList,
  setCurrConversationId,
}: UseAppInitializerProps) {
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false)
  const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false)
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
  const [inited, setInited] = useState<boolean>(false)
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file],
  })

  useEffect(() => {
    if (APP_INFO?.title)
      document.title = `${APP_INFO.title}`
  }, [APP_INFO?.title])

  useEffect(() => {
    if (!hasSetAppConfig) {
      setAppUnavailable(true)
      return
    }

    const initializeApp = async () => {
      try {
        const [conversationData, appParams] = await Promise.all([fetchConversations(), fetchAppParams()])

        const { data: conversations, error } = conversationData as { data: ConversationItem[]; error: string }
        if (error) {
          Toast.notify({ type: 'error', message: error })
          throw new Error(error)
        }

        const _conversationId = getConversationIdFromStorage(APP_ID)
        const isNotNewConversation = conversations.some(item => item.id === _conversationId)

        const { user_input_form, opening_statement: introduction, file_upload, system_parameters }: any = appParams
        setNewConversationInfo({
          name: '新的对话',
          introduction,
        })

        const prompt_variables = userInputsFormToPromptVariables(user_input_form)
        setPromptConfig({
          prompt_template: promptTemplate,
          prompt_variables,
        } as PromptConfig)

        setVisionConfig({
          ...file_upload?.image,
          image_file_size_limit: system_parameters?.system_parameters || 0,
        })

        setConversationList(conversations as ConversationItem[])

        if (isNotNewConversation)
          setCurrConversationId(_conversationId, APP_ID, false)

        setInited(true)
      }
      catch (e: any) {
        if (e.status === 404) {
          setAppUnavailable(true)
        }
        else {
          setIsUnknownReason(true)
          setAppUnavailable(true)
        }
      }
    }

    initializeApp()
  }, [hasSetAppConfig, getConversationIdFromStorage, setNewConversationInfo, setConversationList, setCurrConversationId])

  return {
    appUnavailable,
    isUnknownReason,
    promptConfig,
    inited,
    visionConfig,
  }
}