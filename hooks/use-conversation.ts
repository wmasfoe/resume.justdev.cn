import { useState } from 'react'
import produce from 'immer'
import { useGetState } from 'ahooks'
import type { ConversationItem } from '@/types/app'

const storageConversationIdKey = 'conversationIdInfo'
const APP_NAMESPACE = 'app'

type ConversationInfoType = Omit<ConversationItem, 'inputs' | 'id'>
function useConversation() {
  const [conversationList, setConversationList] = useState<ConversationItem[]>([])
  const [currConversationId, doSetCurrConversationId, getCurrConversationId] = useGetState<string>('-1')
  const setCurrConversationId = (id: string, _legacyAppId?: string, isSetToLocalStroge = true, newConversationName = '') => {
    doSetCurrConversationId(id)
    if (isSetToLocalStroge && id !== '-1') {
      const conversationIdInfo = globalThis.localStorage?.getItem(storageConversationIdKey) ? JSON.parse(globalThis.localStorage?.getItem(storageConversationIdKey) || '') : {}
      conversationIdInfo[APP_NAMESPACE] = id
      globalThis.localStorage?.setItem(storageConversationIdKey, JSON.stringify(conversationIdInfo))
    }
  }

  const getConversationIdFromStorage = (_legacyAppId?: string) => {
    const conversationIdInfo = globalThis.localStorage?.getItem(storageConversationIdKey) ? JSON.parse(globalThis.localStorage?.getItem(storageConversationIdKey) || '') : {}
    return conversationIdInfo[APP_NAMESPACE]
  }

  const isNewConversation = currConversationId === '-1'
  // input can be updated by user
  const [newConversationInputs, setNewConversationInputs] = useState<Record<string, any> | null>(null)
  const resetNewConversationInputs = () => {
    if (!newConversationInputs)
      return
    setNewConversationInputs(produce(newConversationInputs, (draft) => {
      Object.keys(draft).forEach((key) => {
        draft[key] = ''
      })
    }))
  }
  const [existConversationInputs, setExistConversationInputs] = useState<Record<string, any> | null>(null)
  const currInputs = isNewConversation ? newConversationInputs : existConversationInputs
  const setCurrInputs = isNewConversation ? setNewConversationInputs : setExistConversationInputs

  // info is muted
  const [newConversationInfo, setNewConversationInfo] = useState<ConversationInfoType | null>(null)
  const [existConversationInfo, setExistConversationInfo] = useState<ConversationInfoType | null>(null)
  const currConversationInfo = isNewConversation ? newConversationInfo : existConversationInfo

  return {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation,
    currInputs,
    newConversationInputs,
    existConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    currConversationInfo,
    setNewConversationInfo,
    setExistConversationInfo,
  }
}

export default useConversation
