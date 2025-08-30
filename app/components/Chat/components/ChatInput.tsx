import { forwardRef, useCallback } from 'react'
import styles from '../chat.module.css'
import { LoadingIcon, SendIcon } from './Icons'

type ChatInputProps = {
  message: string
  isExpanded: boolean
  isResponding: boolean
  onMessageChange: (value: string) => void
  onSend: (message: string) => void
  onFocus: (e: React.SyntheticEvent) => void
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(({
  message,
  isExpanded,
  isResponding,
  onMessageChange,
  onSend,
  onFocus,
}, ref) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend(message)
    }
  }, [message, onSend])

  const handleSendClick = useCallback(() => {
    onSend(message)
  }, [message, onSend])

  return (
    <div className={`${styles.inputFieldWrapper} ${isExpanded ? styles.expanded : ''}`}>
      <textarea
        ref={ref}
        className={styles.inputField}
        placeholder="对我感兴趣？问点什么..."
        rows={1}
        value={message}
        onChange={e => onMessageChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className={styles.sendButton}
        onClick={handleSendClick}
        disabled={!message.trim() || isResponding}
        title="Send message"
        onFocus={onFocus}
      >
        {isResponding ? <LoadingIcon /> : <SendIcon />}
      </button>
    </div>
  )
})

ChatInput.displayName = 'ChatInput'

export default ChatInput
