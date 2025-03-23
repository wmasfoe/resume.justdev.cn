import React from 'react'
import TargetVersion from '../TargeVersion'
import resumeData from './resume.json'
import styles from './render-resume.module.css'

function GithubWebSite(props: {
  githubInfo: Record<string, any>;
  websiteInfo: Record<string, any>;
  // 希望作用在哪个设备
  applyMode: 'pc' | 'mobile';
}) {
  const { githubInfo, websiteInfo, applyMode } = props

  const firstSpanClassList = `
    ${styles.detail}
    ${styles.split}
    ${applyMode === 'mobile' ? `${styles.mobileOnly} ${styles.onlineOnly}` : ''}
    ${applyMode === 'pc' ? `${styles.pdfOnly} ${styles.pcOnlyInlineFlex}` : ''}
  `
  const secondSpanClassList = `
    ${styles.detail}
    ${applyMode === 'mobile' ? `${styles.mobileOnly} ${styles.onlineOnly}` : ''}
    ${applyMode === 'pc' ? `${styles.pdfOnly} ${styles.pcOnlyInlineFlex}` : ''}
  `
  
  return <>
    {
      githubInfo && (
        <>
          {
            applyMode === 'mobile'
              ? <></>
              : <span className={firstSpanClassList}>|</span>
          }
          <span className={secondSpanClassList}>
            <a href={githubInfo.url} className={styles.notBorderBottom} target="_blank"
              rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M29.3444 30.4765C31.7481 29.977 33.9292 29.1108 35.6247 27.8391C38.5202 25.6676 40 22.3136 40 18.9999C40 16.6752 39.1187 14.505 37.5929 12.6668C36.7427 11.6425 39.2295 3.99989 37.02 5.02919C34.8105 6.05848 31.5708 8.33679 29.8726 7.83398C28.0545 7.29565 26.0733 6.99989 24 6.99989C22.1992 6.99989 20.4679 7.22301 18.8526 7.6344C16.5046 8.23237 14.2591 5.99989 12 5.02919C9.74086 4.05848 10.9736 11.9632 10.3026 12.7944C8.84119 14.6051 8 16.7288 8 18.9999C8 22.3136 9.79086 25.6676 12.6863 27.8391C14.6151 29.2857 17.034 30.2076 19.7401 30.6619"
                  stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round"/>
                <path
                  d="M19.7397 30.6619C18.5812 31.937 18.002 33.1478 18.002 34.2944C18.002 35.441 18.002 38.3464 18.002 43.0106"
                  stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round"/>
                <path
                  d="M29.3446 30.4766C30.4423 31.9174 30.9912 33.211 30.9912 34.3576C30.9912 35.5042 30.9912 38.3885 30.9912 43.0107"
                  stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round"/>
                <path
                  d="M6 31.2155C6.89887 31.3254 7.56554 31.7387 8 32.4554C8.65169 33.5303 11.0742 37.518 13.8251 37.518C15.6591 37.518 17.0515 37.518 18.0024 37.518"
                  stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </a>
          </span>
        </>
      )
    }
    {
      websiteInfo && (
        <>
          <span className={firstSpanClassList}>|</span>
          <span className={secondSpanClassList}>
            <a href={websiteInfo.url} className={styles.notBorderBottom}
              target="_blank"
              rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="12" r="8" fill="none" stroke="var(--foreground)" strokeWidth="4"
                  strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M42 44C42 34.0589 33.9411 26 24 26C14.0589 26 6 34.0589 6 44"
                  stroke="var(--foreground)"
                  strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </span>
        </>
      )
    }
  </>
}

export default function ResumeViewer() {
  return (
    <div className={`${styles.resumeContainer} ${styles.variables}`}>
      {/* 头部信息 - 对应原 handlebars 的 profile-card */}
      <header className={styles.profileCard}>
        <div className={styles.nameAndProfession}>
          <h1>{resumeData.basics.name}</h1>
          <div className={styles.profilesDetail}>
            <p className={styles.jobTitle}>{resumeData.basics.status}</p>
            <span className={`${styles.detail} ${styles.split}`}>|</span>
            <p className={styles.jobTitle}>{resumeData.basics.workingYears}</p>
            <GithubWebSite applyMode={'pc'} githubInfo={resumeData.basics.profiles.gitHub} websiteInfo={resumeData.basics.profiles.portfolio}/>
          </div>
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
            <span className={`${styles.detail} ${styles.split} ${styles.pcOrPDFOnly}`}>|</span>
            <div className={`${styles.pcOrPDFOnly}`}>
              <TargetVersion/>
            </div>
          </div>
          <div className={styles.mobileArea}>
            <GithubWebSite applyMode={'mobile'} githubInfo={resumeData.basics.profiles.gitHub} websiteInfo={resumeData.basics.profiles.portfolio}/>
            <span className={`${styles.onlineOnly} ${styles.mobileOnly} ${styles.detail} ${styles.split}`}>|</span>
            <div className={`${styles.onlineOnly} ${styles.mobileOnly}`}>
              <TargetVersion/>
            </div>
          </div>
        </div>
      </header>

      <section className={`${styles.backgroundCard} ${styles.onlineOnly}`}>
        <h2 className={styles.sectionTitle}>简介</h2>
        <div className={styles.cardNested}>
          <p className={styles.normalText}>{resumeData.basics.summary}</p>
        </div>
      </section>

      {/* 工作经历 - 对应原 handlebars 的 work-experience */}
      <section className={styles.backgroundCard}>
        <h2 className={styles.sectionTitle}>工作经历</h2>
        <div className={styles.workExperience}>
          {resumeData.work.map((job, index) => (
            <div key={index} className={`${styles.cardNested} ${styles.notMargin}`}>
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
        </div>
      </section>

      {/* 项目经验 - 对应原 handlebars 的 workProject */}
      <section className={styles.backgroundCard}>
        <h2 className={styles.sectionTitle}>项目经验</h2>
        {resumeData.workProject.map((project, index) => (
          <div key={index} className={`${styles.cardNested} ${styles.projectCard} ${project.mode === 'online' ? styles.onlineOnly : ''} ${project.mode === 'pdf' ? styles.pdfOnly : ''}`}>
            <div className={styles.projectHeader}>
              <h3>{project.projectName}</h3>
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
      {/* 学历 */}
      <section className={`${styles.backgroundCard} ${styles.onlineOnly}`}>
        <h2 className={styles.sectionTitle}>教育经历</h2>
        {resumeData.education.map((education, index) => (
          <div key={index} className={`${styles.cardNested} ${styles.projectCard} ${styles.openSourceProject}`}>
            <div className={`${styles.projectHeader} ${styles.educationHeader}`}>
              <div className={styles.educationBold}>
                <span>{education.area}</span>
                <span className={`${styles.detail} ${styles.split}`}>|</span>
                <span>{education.studyType}</span>
              </div>
              <span className={styles.educationNormal}>{education.institution}</span>
            </div>
            <p className={styles.educationTime}>{education.startDate} - {education.endDate}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
