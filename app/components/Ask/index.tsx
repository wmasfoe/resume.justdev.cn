'use client'
import React, { Suspense, useCallback, useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { X } from 'lucide-react'
import useBreakpoints, { MediaType } from "@/hooks/use-breakpoints"
import styles from "./ask.module.css"
import Loading from '@/app/components/base/loading'

const Chat = dynamic(() => import('@/app/components/Chat'), { ssr: false })

/**
 * 聊天抽屉组件 - 提供用户与AI对话的界面
 */
interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

function ChatDrawer({ isOpen, onClose, isMobile }: ChatDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

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
        const input = document.querySelector('input[name="message"]') as HTMLInputElement | null
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

  const overlayClassName = `
    ${styles.variables}
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
          <Suspense fallback={<Loading type='app' />}>
            <Chat params={{}} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

/**
 * AgentBot组件 - 提供用户与AI对话的入口
 */
export default function AgentBot() {
  const [isNearby, setIsNearby] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const characterRef = useRef<HTMLDivElement | null>(null)

  const media = useBreakpoints()
  const isMobile = useMemo(() => [MediaType.mobile, MediaType.tablet].includes(media), [media])

  const [isHiding, setIsHiding] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setIsExpanded(false)
    }

    window.addEventListener("click", handleClickOutside)

    return () => {
      window.removeEventListener("click", handleClickOutside)
    }
  }, [])

  const handleCharacterShowModal = () => {
    // 先隐藏卡通人物，然后打开抽屉
    setIsHiding(true)

    // 延迟打开抽屉，等待卡通人物隐藏动画
    setTimeout(() => {
      setIsDrawerOpen(true)
    }, 300)
  }

  const handleCloseDrawer = () => {
    // 先关闭抽屉
    setIsDrawerOpen(false)

    // 延迟显示卡通人物，等待抽屉关闭动画
    setTimeout(() => {
      setIsHiding(false)
    }, 300)
  }

  const handleCharacterClick = () => {
    handleCharacterShowModal()
  }

  return (
    <>
      <div
        className={`
          ${styles.variables}
          ${styles.inputContainer} 
          ${isMobile ? styles.mobile : ""} 
          ${isExpanded ? styles.expanded : ""}
          ${isHiding ? styles.hiding : ""}
          ${isDrawerOpen ? styles.drawerOpen : ""}
        `}
        onMouseEnter={() => !isDrawerOpen && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        ref={characterRef}
        onClick={!isDrawerOpen ? handleCharacterClick : undefined}
      >
        <div className={styles.inputWrapper}>
          <div className={`${styles.inputFieldWrapper} ${isHovering ? styles.hovering : ""}`}>
            <input 
              type="text"
              className={`
                ${styles.inputField}
                ${isNearby ? styles.nearby : ""} 
                ${isExpanded ? styles.expanded : ""}
              `}
              placeholder={isMobile ? "向 AI 咨询关于我的情况" : "您可以在这里向 AI 咨询关于我的情况"}
              readOnly
            />
            <svg className={styles.inputIcon} width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M16.8712 33.0437L15.9976 44.7037C15.9362 45.5231 16.6646 46.0874 17.3161 45.7222C21.9289 43.1384 36.3783 33.6481 43.7017 12.7901C44.0376 11.8333 43.1352 10.9699 42.3646 11.5096C38.0387 14.5391 28.5846 20.8008 22.7421 21.9935C22.7421 21.9935 26.4836 19.3948 28.7231 15.4055C28.9426 15.0144 28.9244 14.5138 28.6796 14.1608L20.5127 2.38942C20.0287 1.69163 19.0354 1.98074 18.8606 2.87019L16.3181 15.8074L4.38437 26.2228C3.78602 26.7448 3.90808 27.7998 4.5989 28.0792L16.8712 33.0437Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M37.9745 28.4481C37.2188 29.5026 35.5908 31.6718 34.0876 32.9975C33.7871 33.2625 33.8276 33.707 34.1724 33.9235L42.1145 38.9092C42.5926 39.2092 43.2384 38.853 43.1576 38.3325C42.7882 35.9498 41.7237 30.982 39.0328 28.3743C38.7322 28.0832 38.2142 28.1138 37.9745 28.4481Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
      <ChatDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} isMobile={isMobile} />
    </>
  )
}

