'use client'

import type { ChangeEvent, FC } from 'react'
import { useState } from 'react'
import { imageUpload } from './utils'
import type { ImageFile } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Toast from '@/app/components/base/toast'

type UploaderProps = {
  children: (hovering: boolean) => JSX.Element
  onUpload: (imageFile: ImageFile) => void
  limit?: number
  disabled?: boolean
}

const Uploader: FC<UploaderProps> = ({
  children,
  onUpload,
  limit,
  disabled,
}) => {
  const [hovering, setHovering] = useState(false)
  const { notify } = Toast

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file)
      return

    if (limit && file.size > limit * 1024 * 1024) {
      notify({ type: 'error', message: `上传图片不能超过 ${limit} MB` })
      return
    }

    const reader = new FileReader()
    reader.addEventListener(
      'load',
      () => {
        const imageFile = {
          type: TransferMethod.local_file,
          _id: `${Date.now()}`,
          fileId: '',
          file,
          url: reader.result as string,
          base64Url: reader.result as string,
          progress: 0,
        }
        onUpload(imageFile)
        imageUpload({
          file: imageFile.file,
          onProgressCallback: (progress) => {
            onUpload({ ...imageFile, progress })
          },
          onSuccessCallback: (res) => {
            onUpload({ ...imageFile, fileId: res.id, progress: 100 })
          },
          onErrorCallback: () => {
            notify({ type: 'error', message: '图片上传失败，请重新上传。' })
            onUpload({ ...imageFile, progress: -1 })
          },
        })
      },
      false,
    )
    reader.addEventListener(
      'error',
      () => {
        notify({ type: 'error', message: '图片读取失败，请重新选择。' })
      },
      false,
    )
    reader.readAsDataURL(file)
  }

  return (
    <div
      className='relative'
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children(hovering)}
      <input
        className={`
          absolute block inset-0 opacity-0 text-[0] w-full
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={e => (e.target as HTMLInputElement).value = ''}
        type='file'
        accept='.png, .jpg, .jpeg, .webp, .gif'
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}

export default Uploader
