import React from 'react'
import type { FC } from 'react'
import RenderResume from '@/app/components/RenderResume'
import type { ResumeData } from '@/types/resume'
import Chat from '@/app/components/Chat'
import resumeJson from '@/resume.json'

const resume = resumeJson as ResumeData

const App: FC = () => {
  return (
    <main className="relative min-h-screen">
      <RenderResume resume={resume} />
      <Chat isFloatingMode />
    </main>
  )
}

export default React.memo(App)
