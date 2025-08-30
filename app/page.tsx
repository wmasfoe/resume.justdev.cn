import React from 'react'
import type { FC } from 'react'
import RenderResume from '@/app/components/RenderResume'
import Chat from '@/app/components/Chat'

const App: FC = () => {
  return (
    <main className="relative min-h-screen">
      <RenderResume />
      <Chat isFloatingMode />
    </main>
  )
}

export default React.memo(App)
