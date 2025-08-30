'use client'
import type { FC } from 'react'
import React from 'react'

type Props = {
  isRequest: boolean
  toolName: string
  content: string
}

const Panel: FC<Props> = ({
  isRequest,
  toolName,
  content,
}) => {
  return (
    <div className='rounded-md bg-gray-100 overflow-hidden border border-black/5'>
      <div className='flex items-center px-2 py-1 leading-[18px] bg-gray-50 uppercase text-xs font-medium text-gray-500'>
        {isRequest ? '请求' : '响应'} {toolName}
      </div>
      <div className='p-2 border-t border-black/5 leading-4 text-xs text-gray-700'>{content}</div>
    </div>
  )
}
export default React.memo(Panel)
