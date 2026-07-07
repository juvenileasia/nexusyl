import { useRef, useState } from 'react'

interface DocumentUploadZoneProps {
  label: string
  hint?: string
  accept?: string
  onUpload: (file: File) => Promise<{ error: string | null }>
}

export function DocumentUploadZone({
  label,
  hint,
  accept = '.pdf,.jpg,.jpeg,.png',
  onUpload,
}: DocumentUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleFile(file: File | null) {
    if (!file) return
    setError('')
    setUploading(true)
    const result = await onUpload(file)
    setUploading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setDone(true)
  }

  return (
    <div>
      <label className="crm-lbl">{label}</label>
      <div
        className={`lms-dropzone${dragging ? ' drag-over' : ''}${done ? ' uploaded' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void handleFile(e.dataTransfer.files[0] ?? null)
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <i className="fa-solid fa-cloud-arrow-up" />
        <p>{uploading ? 'Uploading…' : done ? 'File uploaded successfully' : 'Drag & drop or click to upload'}</p>
        {hint && <small>{hint}</small>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && <div className="err-box" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  )
}
