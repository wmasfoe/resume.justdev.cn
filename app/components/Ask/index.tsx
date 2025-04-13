'use client'

/**
 * AgentBot组件 - 提供用户与AI对话的入口
 */
import styles from './ask.module.css'
import { useState } from 'react'

const mockApiCall = () => new Promise(resolve => setTimeout(resolve, 2000))

export default function AgentBot() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (message.trim()) {
      setIsLoading(true)
      try {
        await mockApiCall()
        setMessage('')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
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

  return (
    <div className={styles.variables}>
      <div className={styles.inputContainer}>
        <div className={styles.inputFieldWrapper}>
          <textarea
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
            disabled={!message.trim() || isLoading}
            title="Send message"
          >
            {isLoading ? <LoadingIcon /> : <SendIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}
