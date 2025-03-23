'use client'
import { useState, useEffect, useRef, useMemo } from "react"
import useBreakpoints, { MediaType } from "@/hooks/use-breakpoints"
import styles from "./agent-bot.module.css"
import ChatDrawer from "./ChatDrawer"

export default function AgentBot() {
  const [isNearby, setIsNearby] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const characterRef = useRef<HTMLDivElement>(null)

  const media = useBreakpoints()
  const isMobile = useMemo(() => [MediaType.mobile, MediaType.tablet].includes(media), [media])

  const [isHiding, setIsHiding] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (characterRef.current && !isMobile) {
        const rect = characterRef.current.getBoundingClientRect()
        const characterX = rect.left + rect.width / 2
        const characterY = rect.top + rect.height / 2

        const distance = Math.sqrt(Math.pow(e.clientX - characterX, 2) + Math.pow(e.clientY - characterY, 2))

        setIsNearby(distance < 100)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile && characterRef.current && !characterRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
        setClickCount(0) // 重置点击计数
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClickOutside)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClickOutside)
    }
  }, [isMobile])

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
    if (isMobile) {
      // 增加点击计数
      const newClickCount = clickCount + 1
      setClickCount(newClickCount)

      // 第一次点击
      if (newClickCount === 1) {
        setIsExpanded(!isExpanded)
      }
      // 第二次点击
      else if (newClickCount > 1) {
        handleCharacterShowModal()
        // 可以在这里添加更多视觉反馈
      }
    } else {
      handleCharacterShowModal()
    }
  }

  return (
    <>
      <div
        className={`
          ${styles.characterContainer} 
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
        <div
          className={`
            ${styles.character} 
            ${isNearby ? styles.nearby : ""} 
            ${isHovering ? styles.hovering : ""}
            ${isExpanded ? styles.expanded : ""}
          `}
        >
          <svg
            className={styles.characterSvg}
            width="100"
            height="100"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 身体 */}
            <circle cx="50" cy="50" r="40" fill="#4F46E5" />
            
            {/* 脸部 */}
            <circle cx="50" cy="45" r="25" fill="#FFFFFF" />
            
            {/* 眼睛 */}
            <g className={styles.eyes}>
              <circle cx="40" cy="40" r="5" fill="#333333" className={styles.eye} />
              <circle cx="60" cy="40" r="5" fill="#333333" className={styles.eye} />
              <ellipse cx="40" cy="40" rx="5" ry="5" fill="#333333" className={styles.eyelid} />
              <ellipse cx="60" cy="40" rx="5" ry="5" fill="#333333" className={styles.eyelid} />
              <circle cx="40" cy="38" r="2" fill="#FFFFFF" className={styles.eyeHighlight} />
              <circle cx="60" cy="38" r="2" fill="#FFFFFF" className={styles.eyeHighlight} />
            </g>
            
            {/* 嘴巴 */}
            <path 
              d="M40,55 Q50,65 60,55" 
              stroke="#333333" 
              strokeWidth="2" 
              fill="none"
              className={styles.mouth}
            />
          </svg>
        </div>

        {(isNearby || isExpanded) && !isDrawerOpen && !isHiding && (
          <div className={styles.prompt}>需要帮忙嘛？</div>
        )}
      </div>
      <ChatDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} isMobile={isMobile} />
    </>
  )
}

