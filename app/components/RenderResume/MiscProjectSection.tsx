'use client'
import React from 'react'
import styles from './render-resume.module.css'
import type { MiscProject } from '@/types/resume'

const MiscProjectSection: React.FC<{ data: MiscProject[] }> = ({ data }) => {
  const [expanded, setExpanded] = React.useState(false)
  if (!data?.length) return null
  return (
    <section className={`${styles.backgroundCard} ${styles.onlineOnly}`}>
      <button
        type="button"
        className={styles.miscToggle}
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <h2 className={styles.sectionTitle}>其他项目 / Other Projects</h2>
        <span className={`${styles.miscChevron} ${expanded ? styles.miscChevronOpen : ''}`} aria-hidden="true">▾</span>
      </button>
      <div className={`${styles.miscBody} ${expanded ? styles.miscBodyOpen : ''}`}>
        {data.map((p, i) => (
          <div key={i} className={`${styles.cardNested} ${styles.projectCard}`}>
            <div className={styles.projectHeader}>
              <h3>
                {p.url
                  ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="arrow-link">{p.projectName}</a>
                  : p.projectName}
              </h3>
            </div>
            {p.workSkill?.length ? (
              <div className={styles.techStack}>
                <span className={styles.techTag}>技术栈: </span>
                {p.workSkill.map((t, j) => (
                  <span key={j} className={`${styles.techTag} ${styles.techTagAfter}`}>{t}</span>
                ))}
              </div>
            ) : null}
            <p>{p.summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MiscProjectSection
