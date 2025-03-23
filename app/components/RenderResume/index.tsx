import React from 'react'
import TargetVersion from '../TargeVersion'
import resumeData from './resume.json'
import styles from './render-resume.module.css'

export default function ResumeViewer() {
  return (
    <div className={styles.resumeContainer}>
      {/* 头部信息 - 对应原 handlebars 的 profile-card */}
      <header className={styles.profileCard}>
        <div className={styles.nameAndProfession}>
          <h1>{resumeData.basics.name}</h1>
          <p className={styles.jobTitle}>{resumeData.basics.label}</p>
          <div className={styles.contactDetails}>
            {resumeData.basics.phone && (
              <span className={styles.detail}>
                <a href={`tel:${resumeData.basics.phone}`} rel="noopener noreferrer">
                  {resumeData.basics.phone}
                </a>
              </span>
            )}
            {resumeData.basics.email && (
              <>
                <span className={`${styles.detail} ${styles.split}`}>|</span>
                <span className={styles.detail}>
                  <a href={`mailto:${resumeData.basics.email}`} rel="noopener noreferrer">
                    {resumeData.basics.email}
                  </a>
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <section className={styles.backgroundCard}>
        <h2 className={styles.sectionTitle}>简介</h2>
        <div className={styles.cardNested}>
          <p className={styles.normalText}>{resumeData.basics.summary}</p>
        </div>
      </section>

      {/* 工作经历 - 对应原 handlebars 的 work-experience */}
      <section className={styles.backgroundCard}>
        <h2 className={styles.sectionTitle}>工作经历</h2>
        {resumeData.work.map((job, index) => (
          <div key={index} className={styles.cardNested}>
            <h3>
              {job.company} - {job.position}
              {job.website && (
                <a href={job.website} target="_blank" rel="noopener noreferrer">
                  <span className="iconify" data-icon="mdi:link"></span>
                </a>
              )}
            </h3>
            <div className={styles.metaInfo}>
              <span>{job.startDate} ~ {job.endDate || '至今'}</span>
              <span className={styles.textMuted}>{job.location}</span>
            </div>
            {job.highlights && (
              <ul className={styles.highlightList}>
                {job.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* 项目经验 - 对应原 handlebars 的 workProject */}
      <section className={styles.backgroundCard}>
        <h2 className={styles.sectionTitle}>项目经验</h2>
        {resumeData.workProject.map((project, index) => (
          <div key={index} className={`${styles.cardNested} ${styles.projectCard}`}>
            <div className={styles.projectHeader}>
              <h3>{project.projectName}</h3>
              {/* 如果需要显示GitHub链接，请确保项目对象中有此属性 */}
              {/* {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
                  <span className="iconify" data-icon="mdi:github"></span>
                </a>
              )} */}
            </div>
            {
              project?.workSkill?.length > 0
                ? <div className={styles.techStack}>
                  <span className={styles.techTag}>技术栈: </span>
                  {project.workSkill?.map((tech, i) => (
                    <span key={i} className={`${styles.techTag} ${styles.techTagAfter}`}>{tech}</span>
                  ))}
                </div>
                : <></>
            }
            {project.desc.map((section, i) => (
              <div key={i} className={styles.descSection}>
                <h4>{section.type}</h4>
                <ul className={styles.contentList}>
                  {section.content.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* 开源项目 */}
      <section className={styles.backgroundCard}>
        <h2 className={styles.sectionTitle}>开源项目</h2>
        {resumeData.openSourceProject.map((project, index) => (
          <div key={index} className={`${styles.cardNested} ${styles.projectCard} ${styles.openSourceProject}`}>
            <div className={`${styles.projectHeader} ${styles.openSourceProjectHeader}`}>
              <h3>
                <a href={project.githubUrl} className="arrow-link" target="_blank">
                  {project.displayName}
                  <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 11H37V29" stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round"
                      strokeLinejoin="round"/>
                    <path d="M11.5439 36.4559L36.9997 11" stroke="var(--foreground)" strokeWidth="4"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </h3>
            </div>
            <div>
              <p>{project.summary}</p>
            </div>
          </div>
        ))}
      </section>
      {/* 添加版本切换组件 */}
      <TargetVersion/>
    </div>
  )
}
