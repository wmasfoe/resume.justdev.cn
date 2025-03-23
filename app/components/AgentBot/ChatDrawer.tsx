import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import { X } from 'lucide-react'
import styles from './chat-drawer.module.css'
import Loading from '@/app/components/base/loading'

const Chat = dynamic(() => import('@/app/components/Chat'), { ssr: true })

export type ChatDrawerProps = {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}

/**
 * 聊天抽屉组件 - 提供用户与AI对话的界面
 */
export default function ChatDrawer({ isOpen, onClose, isMobile }: ChatDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true)

    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }, [onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node))
        handleClose()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClose])

  useEffect(() => {
    // 计算滚动条宽度并设置CSS变量
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)

    if (isOpen) {
      // 禁止背景滚动
      document.body.classList.add('body-no-scroll')

      setTimeout(() => {
        const input = document.querySelector('input[name="message"]') as HTMLInputElement
        input?.focus()
      }, 400)
    } else {
      // 恢复背景滚动
      document.body.classList.remove('body-no-scroll')
    }

    return () => {
      // 组件卸载时确保恢复滚动
      document.body.classList.remove('body-no-scroll')
    };
  }, [isOpen]);

  // TODO 每次打开都要重新拉取历史消息，这里暂时去掉null
  // if (!isOpen && !isClosing) return null;

  const overlayClassName = `
    ${styles.drawerOverlay}
    ${isOpen && !isClosing ? styles.open : ""}
    ${isClosing ? styles.closing : ""}
  `;

  const drawerClassName = `
    ${styles.drawer} 
    ${isMobile ? styles.mobile : ""} 
    ${isOpen && !isClosing ? styles.open : ""}
    ${isClosing ? styles.closing : ""}
    ${isMobile && isInputFocused ? styles.inputFocused : ""}
  `

  return (
    <div className={overlayClassName}>
      <div ref={drawerRef} className={drawerClassName}>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="关闭"
        >
          <X size={20} />
        </button>

        <div className={`${styles.drawerContent} h-full flex-col gap-4`}>
          <h3 className={styles.drawerTitle}>有什么可以帮到你？</h3>
          {/* pass */}
          <Suspense fallback={<Loading type='app' />}>
            <Chat params={{}} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

ChatDrawer.displayName = 'ChatDrawer'
