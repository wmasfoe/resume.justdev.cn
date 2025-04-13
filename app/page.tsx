'use client'

import React, { useState } from 'react'
import type { FC } from 'react'
import RenderResume from '@/app/components/RenderResume'
import Ask from '@/app/components/Ask'
import { sendChatMessage } from '@/service'

const App: FC = () => {
  const [isResponding, setIsResponding] = useState(false)
  const [answer, setAnswer] = useState('')

  const handleSend = async (message: string) => {
    setIsResponding(true)
    setAnswer('')

    try {
      await sendChatMessage(
        { query: message },
        {
          onData: (text, isFirst) => {
            setAnswer(prev => prev + text)
          },
          onCompleted: () => {
            setIsResponding(false)
          },
          onError: () => {
            setIsResponding(false)
          },
          onThought: () => {},
          onFile: () => {},
          onMessageEnd: () => {},
          onMessageReplace: () => {},
          onWorkflowStarted: () => {},
          onNodeStarted: () => {},
          onNodeFinished: () => {},
          onWorkflowFinished: () => {},
        }
      )
    } catch (error) {
      console.error(error)
      setIsResponding(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <RenderResume />
      <Ask 
        onSend={handleSend}
        isResponding={isResponding}
        answer={answer}
      />
    </main>
  )
}

export default React.memo(App)
