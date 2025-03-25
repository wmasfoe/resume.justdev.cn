'use client'
import Image from 'next/image'
import React from 'react'
import imageSource from './surfing.svg'

interface EmptyProps {
  className?: string
}

const Empty: React.FC<EmptyProps> = ({
  className = '',
}) => {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <div className='relative w-full h-full'>
        <Image
          src={imageSource}
          alt="空态图片"
          fill
          className='object-contain'
          priority
        />
      </div>
    </div>
  )
}

export default Empty
