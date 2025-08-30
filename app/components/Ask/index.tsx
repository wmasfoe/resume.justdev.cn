'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import produce, { setAutoFreeze } from 'immer'
import { useBoolean, useGetState } from 'ahooks'

import styles from './ask.module.css'
import ChatInput from './components/ChatInput'
import useAppInitializer from './hooks/useAppInitializer'
import useChatManager from './hooks/useChatManager'
import useMobileViewport from './hooks/useMobileViewport'
import useUIState from './hooks/useUIState'
import { checkCanSend, generateNewChatListWithOpenStatement } from './utils/chatHelpers'
import ChatCore from '@/app/components/Chat/ChatCore'
import Toast from '@/app/components/base/toast'
import { API_KEY, APP_ID } from '@/config'
import useConversation from '@/hooks/use-conversation'
import { fetchChatList } from '@/service'
import type { ChatItem } from '@/types/app'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'

type Props = {
  className?: string
}

export default function Ask({ className }: Props) {
  // Custom hooks
  const uiState = useUIState()
  const { inputRef } = useMobileViewport(uiState.isExpanded)
  const hasSetAppConfig = APP_ID && API_KEY

  // Immer configuration
  useEffect(() => {
    setAutoFreeze(false)
    return () => {
      setAutoFreeze(true)
    }
  }, [])

  // Conversation management
  const {
    conversationList,
    setConversationList,
    currConversationId,
    getCurrConversationId,
    setCurrConversationId,
    getConversationIdFromStorage,
    isNewConversation,
    currConversationInfo,
    currInputs,
    newConversationInputs,
    resetNewConversationInputs,
    setCurrInputs,
    setNewConversationInfo,
    setExistConversationInfo,
  } = useConversation()

  const conversationIntroduction = currConversationInfo?.introduction || ''
  const [conversationIdChangeBecauseOfNew, setConversationIdChangeBecauseOfNew, getConversationIdChangeBecauseOfNew] = useGetState(false)
  const [isChatStarted, { setFalse: setChatNotStarted }] = useBoolean(false)

  // App initialization
  const { promptConfig, inited: initialized, visionConfig } = useAppInitializer({
    hasSetAppConfig,
    getConversationIdFromStorage,
    setNewConversationInfo,
    setConversationList,
    setCurrConversationId,
  })

  // Chat management
  const { chatList, setChatList, isResponding, handleSend: handleChatSend, handleFeedback } = useChatManager({
    currConversationId,
    getCurrConversationId,
    isNewConversation,
    currInputs: currInputs || {},
    visionConfig,
    conversationIdChangeBecauseOfNew,
    getConversationIdChangeBecauseOfNew,
    setConversationIdChangeBecauseOfNew,
    resetNewConversationInputs,
    setChatNotStarted,
    setCurrConversationId,
  })

  // Conversation switching logic
  const handleConversationSwitch = useCallback(() => {
    if (!initialized)
      return

    let notSyncToStateIntroduction = ''
    let notSyncToStateInputs: Record<string, any> | undefined | null = {}
    if (!isNewConversation) {
      const item = conversationList.find(item => item.id === currConversationId)
      notSyncToStateInputs = item?.inputs || {}
      setCurrInputs(notSyncToStateInputs as any)
      notSyncToStateIntroduction = item?.introduction || ''
      setExistConversationInfo({
        name: item?.name || '',
        introduction: notSyncToStateIntroduction,
      })
    }
    else {
      notSyncToStateInputs = newConversationInputs
      setCurrInputs(notSyncToStateInputs)
    }

    // 更新当前会话的聊天列表
    if (!isNewConversation && !conversationIdChangeBecauseOfNew && !isResponding) {
      fetchChatList(currConversationId).then((res: any) => {
        const { data } = res
        const newChatList: ChatItem[] = generateNewChatListWithOpenStatement(
          notSyncToStateIntroduction,
          notSyncToStateInputs,
          conversationIntroduction,
          currInputs,
          promptConfig,
        )

        data.forEach((item: any) => {
          newChatList.push({
            id: `question-${item.id}`,
            content: item.query,
            isAnswer: false,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'user') || [],
          })
          newChatList.push({
            id: item.id,
            content: item.answer,
            agent_thoughts: addFileInfos(item.agent_thoughts ? sortAgentSorts(item.agent_thoughts) : item.agent_thoughts, item.message_files),
            feedback: item.feedback,
            isAnswer: true,
            message_files: item.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [],
          })
        })
        setChatList(newChatList)
      })
    }

    if (isNewConversation && isChatStarted) {
      setChatList(generateNewChatListWithOpenStatement(
        '',
        undefined,
        conversationIntroduction,
        currInputs,
        promptConfig,
      ))
    }
  }, [
    initialized,
    isNewConversation,
    conversationList,
    currConversationId,
    setCurrInputs,
    setExistConversationInfo,
    newConversationInputs,
    conversationIdChangeBecauseOfNew,
    isResponding,
    isChatStarted,
    setChatList,
    conversationIntroduction,
    currInputs,
    promptConfig,
  ])

  useEffect(handleConversationSwitch, [handleConversationSwitch])

  // Chat list scroll management
  const chatListDomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chatListDomRef.current)
      chatListDomRef.current.scrollTop = chatListDomRef.current.scrollHeight
  }, [chatList, currConversationId])

  // New chat creation (currently unused but may be needed for future features)
  const _createNewChat = useCallback(() => {
    if (conversationList.some(item => item.id === '-1'))
      return

    setConversationList(produce(conversationList, (draft) => {
      draft.unshift({
        id: '-1',
        name: '新的对话',
        inputs: newConversationInputs,
        introduction: conversationIntroduction,
      })
    }))
  }, [conversationList, setConversationList, newConversationInputs, conversationIntroduction])

  // Unused but kept for potential future use
  // const handleStartChat = useCallback((inputs: Record<string, any>) => {
  //   createNewChat()
  //   setConversationIdChangeBecauseOfNew(true)
  //   setCurrInputs(inputs)
  //   setChatStarted()
  //   setChatList(generateNewChatListWithOpenStatement(
  //     '',
  //     inputs,
  //     conversationIntroduction,
  //     currInputs,
  //     promptConfig,
  //   ))
  // }, [createNewChat, setConversationIdChangeBecauseOfNew, setCurrInputs, setChatStarted, setChatList, conversationIntroduction, currInputs, promptConfig])

  // Message validation and sending
  const { notify } = Toast
  const logError = useCallback((message: string) => {
    notify({ type: 'error', message })
  }, [notify])

  const handleCanSend = useCallback(() => {
    return checkCanSend(currConversationId, currInputs, promptConfig, logError)
  }, [currConversationId, currInputs, promptConfig, logError])

  const handleSend = useCallback((message: string) => {
    if (!message.trim())
      return
    uiState.setMessage('')
    handleChatSend(message)
  }, [uiState, handleChatSend])

  return (
    <div className={`${styles.variables} ${className ?? ''}`}>
      <div
        className={`${styles.inputContainer} ${uiState.isExpanded ? '' : styles.hoverScale}`}
        onClick={uiState.handleFocus}
      >
        <div className={styles.chatContainer}>
          <div
            className={`
              ${styles.chatWrapper}
              relative
              h-[500px]
              opacity-100
            `}
            style={{ transition: uiState.isExpanding ? 'all 500ms ease-out' : 'none' }}
          >
            <ChatCore
              chatList={chatList}
              onSend={handleChatSend}
              onFeedback={handleFeedback}
              isResponding={isResponding}
              checkCanSend={handleCanSend}
              visionConfig={visionConfig}
              isHideSendInput
            />
          </div>
        </div>

        <ChatInput
          ref={inputRef}
          message={uiState.message}
          isExpanded={uiState.isExpanded}
          isResponding={isResponding}
          onMessageChange={uiState.setMessage}
          onSend={handleSend}
          onFocus={uiState.handleFocus}
        />
      </div>
    </div>
  )
}
