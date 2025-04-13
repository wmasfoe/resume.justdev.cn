'use client'

import { useState, useEffect, useRef, ReactEventHandler, SyntheticEvent } from 'react'
import dynamic from 'next/dynamic'
import styles from './ask.module.css'
import type { ChatItem } from '@/types/app'
import ChatCore from '@/app/components/Chat/ChatCore'

interface Props {
  onSend: (message: string) => void
  isResponding?: boolean
  className?: string
  answer?: string
}

export default function Ask({ onSend, isResponding, className, answer }: Props) {
  const [message, setMessage] = useState('')
  const [isExpanding, setIsExpanding] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [chatList, setChatList] = useState<ChatItem[]>([])
  const [hasChatHistory, setHasChatHistory] = useState(false)
  const [focusTimer, setFocusTimer] = useState<NodeJS.Timeout | null>(null)
  const [isMouseInContainer, setIsMouseInContainer] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    let documentRef: Document | undefined;
    console.log('123')
    const handleClickOutside = (e: MouseEvent) => {
      setIsExpanded(false);
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
    setChatList([]);
    setHasChatHistory(false);
    setIsExpanded(false);
  };

  // 新增自动聚焦逻辑
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // const handleMouseEnter = () => {
  //   setIsMouseInContainer(true)
  //   if (focusTimer) {
  //     clearTimeout(focusTimer)
  //     setFocusTimer(null)
  //   }
  // }

  // const handleMouseLeave = () => {
  //   setIsMouseInContainer(false)
  //   // 只有当输入框没有焦点时才关闭
  //   if (!inputRef.current?.contains(document.activeElement)) {
  //     const timer = setTimeout(() => {
  //       setIsExpanding(false)
  //       setIsExpanded(false)
  //     }, 200)
  //     setFocusTimer(timer)
  //   }
  // }

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
  }

  const handleSubmit = async () => {
    if (message.trim()) {
      // 添加用户问题到列表
      const newQuestion: ChatItem = {
        id: `question-${Date.now()}`,
        content: message,
        isAnswer: false
      }
      
      setChatList(prev => [...prev, newQuestion])
      onSend(message)
      setMessage('')
      
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
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
              onSend={onSend}
              isResponding={isResponding}
              isHideSendInput
              feedbackDisabled
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
            onClick={handleSubmit}
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
