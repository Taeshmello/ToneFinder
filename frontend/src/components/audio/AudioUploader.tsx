import { useRef, useState } from 'react'

interface Props {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

export default function AudioUploader({ onFileSelected, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) return
    onFileSelected(file)
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
      className={[
        'flex flex-col items-center justify-center gap-3',
        'w-full h-48 rounded-2xl border-2 border-dashed',
        'transition-colors cursor-pointer select-none',
        disabled
          ? 'opacity-50 cursor-not-allowed border-slate-200'
          : isDragging
          ? 'border-teal-400 bg-teal-50'
          : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50',
      ].join(' ')}
    >
      <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
      <p className="text-sm text-slate-500">
        오디오/영상 파일을 드래그하거나 <span className="text-teal-600 font-medium">클릭</span>하여 선택
      </p>
      <p className="text-xs text-slate-400">MP3, WAV, MP4, M4A 등 지원</p>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
