import React from 'react'
import type { FC } from 'react'
import RenderResume from '@/app/components/RenderResume'
import Ask from '@/app/components/Ask'

const App: FC = () => {

  return (
    <main className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <RenderResume />
      <Ask />
    </main>
  )
}

export default React.memo(App)
