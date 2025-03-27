import type { FC } from 'react'
import React from 'react'

import type { IMainProps } from '@/app/components/Chat'
import RenderResume from '@/app/components/RenderResume'
import Ask from '@/app/components/Ask'

const App: FC<IMainProps> = ({
  params,
}: any) => {

  return <>
    <RenderResume />
    <Ask />
  </>
}

export default React.memo(App)
