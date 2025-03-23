import type { FC } from 'react'
import React from 'react'

import type { IMainProps } from '@/app/components/Chat'
import RenderResume from '@/app/components/RenderResume'
import AgentBot from '@/app/components/AgentBot'

const App: FC<IMainProps> = ({
  params,
}: any) => {

  return <>
    <RenderResume />
    <AgentBot />
  </>
}

export default React.memo(App)
