import React from 'react'
import type { FC } from 'react'
import RenderResume from '@/app/components/RenderResume'
import Ask from '@/app/components/Ask'

const App: FC = () => {

  return (
    <main className="relative min-h-screen">
      <RenderResume />
      <Ask />
    </main>
  )
}

export default React.memo(App)
