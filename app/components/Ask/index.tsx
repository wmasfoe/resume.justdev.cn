'use client'

import React, { useState, useEffect, useRef, ReactEventHandler, SyntheticEvent } from 'react'
import styles from './ask.module.css'
import { useTranslation } from 'react-i18next'
import produce, { setAutoFreeze } from 'immer'
import { useBoolean, useGetState } from 'ahooks'
import useConversation from '@/hooks/use-conversation'
import Toast from '@/app/components/base/toast'
import { fetchAppParams, fetchChatList, fetchConversations, generationConversationName, sendChatMessage, updateFeedback } from '@/service'
import type { ChatItem, ConversationItem, Feedbacktype, PromptConfig, VisionFile, VisionSettings } from '@/types/app'
import { Resolution, TransferMethod, WorkflowRunningStatus } from '@/types/app'
import ChatCore from '@/app/components/Chat/ChatCore'
import { setLocaleOnClient } from '@/i18n/client'
import Loading from '@/app/components/base/loading'
import { replaceVarWithValues, userInputsFormToPromptVariables } from '@/utils/prompt'
import { API_KEY, APP_ID, APP_INFO, isShowPrompt, promptTemplate } from '@/config'
import type { Annotation as AnnotationType } from '@/types/log'
import { addFileInfos, sortAgentSorts } from '@/utils/tools'

interface Props {
  className?: string
}

export default function Ask({ className }: Props) {
  const [message, setMessage] = useState('')
  const [isExpanding, setIsExpanding] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasChatHistory, setHasChatHistory] = useState(false)
  const [focusTimer, setFocusTimer] = useState<NodeJS.Timeout | null>(null)
  const [isMouseInContainer, setIsMouseInContainer] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let documentRef: Document | undefined;
    const handleClickOutside = (e: MouseEvent) => {
      setIsExpanded(false);
      document.body.style.overflow = 'auto'
    };

    if (typeof document !== 'undefined') {
      documentRef = document;
      documentRef.addEventListener('click', handleClickOutside);
    }

    return () => {
      if (documentRef) {
        documentRef.removeEventListener('click', handleClickOutside);
      }
    };
  }, [isExpanded]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasChatHistory(false);
    setIsExpanded(false);
  };

  // 新增自动聚焦逻辑
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  function handleFocus<T>(e: SyntheticEvent<T, Event>) {
    // 清除任何现有的关闭定时器
    if (focusTimer) {
      clearTimeout(focusTimer)
      setFocusTimer(null)
    }
    
    setIsExpanded(true)
    
    if (hasChatHistory) {
      // 使用requestAnimationFrame确保DOM已更新
      requestAnimationFrame(() => {
        setIsExpanding(true)
      })
    }

    e.nativeEvent.stopImmediatePropagation();
    document.body.style.overflow = 'hidden'
  }

  const { t } = useTranslation()
    const hasSetAppConfig = APP_ID && API_KEY
  
    /*
     * 应用信息
     */
    const [appUnavailable, setAppUnavailable] = useState<boolean>(false)
    const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false)
    const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
    const [inited, setInited] = useState<boolean>(false)
    // 在移动端，通过点击按钮显示侧边栏
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
  
    // 当数据改变时更新思维（produce对象）。https://github.com/immerjs/immer/issues/576
    useEffect(() => {
      setAutoFreeze(false)
      return () => {
        setAutoFreeze(true)
      }
    }, [])
  
    /*
     * conversation info
     */
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
  
    const [conversationIdChangeBecauseOfNew, setConversationIdChangeBecauseOfNew, getConversationIdChangeBecauseOfNew] = useGetState(false)
    const [isChatStarted, { setTrue: setChatStarted, setFalse: setChatNotStarted }] = useBoolean(false)
    // 开始新的聊天
    const handleStartChat = (inputs: Record<string, any>) => {
      createNewChat()
      setConversationIdChangeBecauseOfNew(true)
      setCurrInputs(inputs)
      setChatStarted()
      // parse variables in introduction
      setChatList(generateNewChatListWithOpenStatement('', inputs))
    }
    const conversationIntroduction = currConversationInfo?.introduction || ''
  
    const handleConversationSwitch = () => {
      if (!inited)
        return
  
      // 更新当前会话的输入
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
          const newChatList: ChatItem[] = generateNewChatListWithOpenStatement(notSyncToStateIntroduction, notSyncToStateInputs)
  
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
  
      if (isNewConversation && isChatStarted)
        setChatList(generateNewChatListWithOpenStatement())
    }
    useEffect(handleConversationSwitch, [currConversationId, inited])
  
    /*
     * 聊天信息。聊天从属于会话。
     */
    const [chatList, setChatList, getChatList] = useGetState<ChatItem[]>([])
    const chatListDomRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
      // 滚动到底部
      if (chatListDomRef.current)
        chatListDomRef.current.scrollTop = chatListDomRef.current.scrollHeight
    }, [chatList, currConversationId])
    // 如果用户已发送消息，则不能编辑输入
    const createNewChat = () => {
      // 如果新聊天已存在，不要创建新聊天
      if (conversationList.some(item => item.id === '-1'))
        return
  
      setConversationList(produce(conversationList, (draft) => {
        draft.unshift({
          id: '-1',
          name: t('app.chat.newChatDefaultName'),
          inputs: newConversationInputs,
          introduction: conversationIntroduction,
        })
      }))
    }
  
    // 有时介绍内容未应用到状态
    const generateNewChatListWithOpenStatement = (introduction?: string, inputs?: Record<string, any> | null) => {
      let calculatedIntroduction = introduction || conversationIntroduction || ''
      const calculatedPromptVariables = inputs || currInputs || null
      if (calculatedIntroduction && calculatedPromptVariables)
        calculatedIntroduction = replaceVarWithValues(calculatedIntroduction, promptConfig?.prompt_variables || [], calculatedPromptVariables)
  
      const openStatement = {
        id: `${Date.now()}`,
        content: calculatedIntroduction,
        isAnswer: true,
        feedbackDisabled: true,
        isOpeningStatement: isShowPrompt,
      }
      if (calculatedIntroduction)
        return [openStatement]
  
      return []
    }
  
    // init
    useEffect(() => {
      if (!hasSetAppConfig) {
        setAppUnavailable(true)
        return
      }
      (async () => {
        try {
          const [conversationData, appParams] = await Promise.all([fetchConversations(), fetchAppParams()])
  
          // 处理当前会话ID
          const { data: conversations, error } = conversationData as { data: ConversationItem[]; error: string }
          if (error) {
            Toast.notify({ type: 'error', message: error })
            throw new Error(error)
            return
          }
          const _conversationId = getConversationIdFromStorage(APP_ID)
          const isNotNewConversation = conversations.some(item => item.id === _conversationId)
  
          // 获取新会话信息
          const { user_input_form, opening_statement: introduction, file_upload, system_parameters }: any = appParams
          setLocaleOnClient(APP_INFO.default_language, true)
          setNewConversationInfo({
            name: t('app.chat.newChatDefaultName'),
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
      })()
    }, [])
  
    const [isResponding, { setTrue: setRespondingTrue, setFalse: setRespondingFalse }] = useBoolean(false)
    const [abortController, setAbortController] = useState<AbortController | null>(null)
    const { notify } = Toast
    const logError = (message: string) => {
      notify({ type: 'error', message })
    }
  
    const checkCanSend = () => {
      if (currConversationId !== '-1')
        return true
  
      if (!currInputs || !promptConfig?.prompt_variables)
        return true
  
      const inputLens = Object.values(currInputs).length
      const promptVariablesLens = promptConfig.prompt_variables.length
  
      const emptyInput = inputLens < promptVariablesLens || Object.values(currInputs).find(v => !v)
      if (emptyInput) {
        logError(t('app.errorMessage.valueOfVarRequired'))
        return false
      }
      return true
    }
  
    const [messageTaskId, setMessageTaskId] = useState('')
    const [isRespondingConIsCurrCon, setIsRespondingConCurrCon, getIsRespondingConIsCurrCon] = useGetState(true)
  
    const updateCurrentQA = ({
      responseItem,
      questionId,
      placeholderAnswerId,
      questionItem,
    }: {
      responseItem: ChatItem
      questionId: string
      placeholderAnswerId: string
      questionItem: ChatItem
    }) => {
      // 闭包中的新列表已过时
      const newListWithAnswer = produce(
        getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
        (draft) => {
          if (!draft.find(item => item.id === questionId))
            draft.push({ ...questionItem })
  
          draft.push({ ...responseItem })
        })
      setChatList(newListWithAnswer)
    }
  
    const handleSend = async (message: string, files?: VisionFile[]) => {
      if (isResponding) {
        notify({ type: 'info', message: t('app.errorMessage.waitForResponse') })
        return
      }
      const data: Record<string, any> = {
        inputs: currInputs,
        query: message,
        conversation_id: isNewConversation ? null : currConversationId,
      }

      setMessage('')
  
      if (visionConfig?.enabled && files && files?.length > 0) {
        data.files = files.map((item) => {
          if (item.transfer_method === TransferMethod.local_file) {
            return {
              ...item,
              url: '',
            }
          }
          return item
        })
      }
  
      // question
      const questionId = `question-${Date.now()}`
      const questionItem = {
        id: questionId,
        content: message,
        isAnswer: false,
        message_files: files,
      }
  
      const placeholderAnswerId = `answer-placeholder-${Date.now()}`
      const placeholderAnswerItem = {
        id: placeholderAnswerId,
        content: '',
        isAnswer: true,
      }
  
      const newList = [...getChatList(), questionItem, placeholderAnswerItem]
      setChatList(newList)
  
      let isAgentMode = false
  
      // answer
      const responseItem: ChatItem = {
        id: `${Date.now()}`,
        content: '',
        agent_thoughts: [],
        message_files: [],
        isAnswer: true,
      }
      let hasSetResponseId = false
  
      const prevTempNewConversationId = getCurrConversationId() || '-1'
      let tempNewConversationId = ''
  
      setRespondingTrue()
      sendChatMessage(data, {
        getAbortController: (abortController) => {
          setAbortController(abortController)
        },
        onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId, messageId, taskId }: any) => {
          if (!isAgentMode) {
            responseItem.content = responseItem.content + message
          }
          else {
            const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
            if (lastThought)
              lastThought.thought = lastThought.thought + message // need immer setAutoFreeze
          }
          if (messageId && !hasSetResponseId) {
            responseItem.id = messageId
            hasSetResponseId = true
          }
  
          if (isFirstMessage && newConversationId)
            tempNewConversationId = newConversationId
  
          setMessageTaskId(taskId)
          // has switched to other conversation
          if (prevTempNewConversationId !== getCurrConversationId()) {
            setIsRespondingConCurrCon(false)
            return
          }
          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        async onCompleted(hasError?: boolean) {
          if (hasError)
            return
  
          if (getConversationIdChangeBecauseOfNew()) {
            const { data: allConversations }: any = await fetchConversations()
            const newItem: any = await generationConversationName(allConversations[0].id)
  
            const newAllConversations = produce(allConversations, (draft: any) => {
              draft[0].name = newItem.name
            })
            setConversationList(newAllConversations as any)
          }
          setConversationIdChangeBecauseOfNew(false)
          resetNewConversationInputs()
          setChatNotStarted()
          setCurrConversationId(tempNewConversationId, APP_ID, true)
          setRespondingFalse()
        },
        onFile(file) {
          const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1]
          if (lastThought)
            lastThought.message_files = [...(lastThought as any).message_files, { ...file }]
  
          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        onThought(thought) {
          isAgentMode = true
          const response = responseItem as any
          if (thought.message_id && !hasSetResponseId) {
            response.id = thought.message_id
            hasSetResponseId = true
          }
          // responseItem.id = thought.message_id;
          if (response.agent_thoughts.length === 0) {
            response.agent_thoughts.push(thought)
          }
          else {
            const lastThought = response.agent_thoughts[response.agent_thoughts.length - 1]
            // thought changed but still the same thought, so update.
            if (lastThought.id === thought.id) {
              thought.thought = lastThought.thought
              thought.message_files = lastThought.message_files
              responseItem.agent_thoughts![response.agent_thoughts.length - 1] = thought
            }
            else {
              responseItem.agent_thoughts!.push(thought)
            }
          }
          // has switched to other conversation
          if (prevTempNewConversationId !== getCurrConversationId()) {
            setIsRespondingConCurrCon(false)
            return false
          }
  
          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem,
          })
        },
        onMessageEnd: (messageEnd) => {
          if (messageEnd.metadata?.annotation_reply) {
            responseItem.id = messageEnd.id
            responseItem.annotation = ({
              id: messageEnd.metadata.annotation_reply.id,
              authorName: messageEnd.metadata.annotation_reply.account.name,
            } as AnnotationType)
            const newListWithAnswer = produce(
              getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
              (draft) => {
                if (!draft.find(item => item.id === questionId))
                  draft.push({ ...questionItem })
  
                draft.push({
                  ...responseItem,
                })
              })
            setChatList(newListWithAnswer)
            return
          }
          // 不支持显示引用
          // responseItem.citation = messageEnd.retriever_resources
          const newListWithAnswer = produce(
            getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
            (draft) => {
              if (!draft.find(item => item.id === questionId))
                draft.push({ ...questionItem })
  
              draft.push({ ...responseItem })
            })
          setChatList(newListWithAnswer)
        },
        onMessageReplace: (messageReplace) => {
          setChatList(produce(
            getChatList(),
            (draft) => {
              const current = draft.find(item => item.id === messageReplace.id)
  
              if (current)
                current.content = messageReplace.answer
            },
          ))
        },
        onError() {
          setRespondingFalse()
          // 回滚占位符答案
          setChatList(produce(getChatList(), (draft) => {
            draft.splice(draft.findIndex(item => item.id === placeholderAnswerId), 1)
          }))
        },
        onWorkflowStarted: ({ workflow_run_id, task_id }) => {
          // 设置任务ID引用
          // taskIdRef.current = task_id
          responseItem.workflow_run_id = workflow_run_id
          responseItem.workflowProcess = {
            status: WorkflowRunningStatus.Running,
            tracing: [],
          }
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            draft[currentIndex] = {
              ...draft[currentIndex],
              ...responseItem,
            }
          }))
        },
        onWorkflowFinished: ({ data }) => {
          responseItem.workflowProcess!.status = data.status as WorkflowRunningStatus
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            draft[currentIndex] = {
              ...draft[currentIndex],
              ...responseItem,
            }
          }))
        },
        onNodeStarted: ({ data }) => {
          responseItem.workflowProcess!.tracing!.push(data as any)
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            draft[currentIndex] = {
              ...draft[currentIndex],
              ...responseItem,
            }
          }))
        },
        onNodeFinished: ({ data }) => {
          const currentIndex = responseItem.workflowProcess!.tracing!.findIndex(item => item.node_id === data.node_id)
          responseItem.workflowProcess!.tracing[currentIndex] = data as any
          setChatList(produce(getChatList(), (draft) => {
            const currentIndex = draft.findIndex(item => item.id === responseItem.id)
            draft[currentIndex] = {
              ...draft[currentIndex],
              ...responseItem,
            }
          }))
        },
      })
    }
  
    const handleFeedback = async (messageId: string, feedback: Feedbacktype) => {
      await updateFeedback({ url: `/messages/${messageId}/feedbacks`, body: { rating: feedback.rating } })
      const newChatList = chatList.map((item) => {
        if (item.id === messageId) {
          return {
            ...item,
            feedback,
          }
        }
        return item
      })
      setChatList(newChatList)
      notify({ type: 'success', message: t('common.api.success') })
    }
  
    // TODO 暂时去掉，后续需要加入挂载失败重试功能
    // if (appUnavailable)
    //   return <AppUnavailable isUnknownReason={isUnknownReason} errMessage={!hasSetAppConfig ? 'Please set APP_ID and API_KEY in config/index.tsx' : ''} />
  
    if (!APP_ID || !APP_INFO || !promptConfig || appUnavailable)
      return <Loading type='app' />
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(message)
    }
  }

  return (
    <div className={`${styles.variables} ${className ?? ''}`}>
      <div 
        className={styles.inputContainer}
        onClick={handleFocus}
      >
        <div className={styles.chatContainer}>
          <div 
            className={`
              ${styles.chatWrapper}
              relative
              h-[500px]
              opacity-100
            `}
            style={{ transition: isExpanding ? 'all 500ms ease-out' : 'none' }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="关闭聊天"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <ChatCore
              chatList={chatList}
              onSend={handleSend}
              onFeedback={handleFeedback}
              isResponding={isResponding}
              checkCanSend={checkCanSend}
              visionConfig={visionConfig}
              isHideSendInput
            />
          </div>
        </div>

        {/* 输入框 */}
        <div className={`${styles.inputFieldWrapper} ${isExpanded ? styles.expanded : ''}`}>
          <textarea
            ref={inputRef}
            className={styles.inputField}
            placeholder="对我感兴趣？问点什么..."
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className={styles.sendButton}
            onClick={() => handleSend(message)}
            disabled={!message.trim() || isResponding}
            title="Send message"
            onFocus={handleFocus}
          >
            {isResponding ? <LoadingIcon /> : <SendIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}

const LoadingIcon = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle 
      className="opacity-25" 
      cx="8" 
      cy="8" 
      r="7" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <path 
      className="opacity-75" 
      d="M15 8a7 7 0 0 0-7-7" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
)

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M1.5 7.5L14.5 1.5L8.5 14.5L7 8.5L1.5 7.5Z" 
      fill="currentColor"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
)
