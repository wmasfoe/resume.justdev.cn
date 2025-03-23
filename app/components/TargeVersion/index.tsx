'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import styles from './style.module.css'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'

/**
 * 版本切换组件，用于区分PDF和在线版本
 */
const TargetVersion: React.FC = () => {
  const media = useBreakpoints()
  const isMobile = useMemo(() => [MediaType.tablet, MediaType.mobile].includes(media), [media])

  return (
    <div className={styles.versionContainer}>
      {/* 只在在线版本显示 */}
      <div className={styles.onlineOnly}>
        <p className={styles.versionText}>
          <Link
            href="/pdfs/resume.pdf"
            target="_blank"
            className={styles.versionLink}
          >
            {
              isMobile
                ? 'PDF 版本'
                : '前往 PDF 版本'
            }
            <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H37V29" stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.5439 36.4559L36.9997 11" stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </p>
      </div>

      {/* 只在PDF版本显示 */}
      <div className={styles.pdfOnly}>
        <p className={styles.versionText}>
          <Link
            href="https://resume.xhub.xin"
            target="_blank"
            className={styles.versionLink}
          >
            前往在线版本
            <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H37V29" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.5439 36.4559L36.9997 11" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </p>
      </div>
    </div>
  )
}

TargetVersion.displayName = 'TargetVersion'

export default TargetVersion
