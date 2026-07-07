import { useEffect, useState } from 'react'
import { addQuickModule, useCourses } from '../../hooks/useCourses'
import { extractYoutubeId } from '../../lib/youtube'
import type { ModuleDraft, ModuleType } from '../../types/database'
import { MODULE_TYPE_META } from '../../types/database'

export function ContentPage() {
  const { courses, loading, error: coursesError, refresh } = useCourses()
  const [courseId, setCourseId] = useState('')
  const [moduleType, setModuleType] = useState<ModuleType>('video')
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('30 min')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [textBody, setTextBody] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (courses.length && !courseId) {
      setCourseId(courses[0].id)
    }
  }, [courses, courseId])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function resetFields() {
    setTitle('')
    setDuration('30 min')
    setYoutubeUrl('')
    setTextBody('')
    setPdfFile(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!courseId) {
      setError('Please select a course.')
      return
    }
    if (!title.trim()) {
      setError('Module title is required.')
      return
    }

    let content: ModuleDraft['content']
    if (moduleType === 'video') {
      content = { url: youtubeUrl, youtubeId: extractYoutubeId(youtubeUrl) }
    } else if (moduleType === 'text') {
      content = { body: textBody }
    } else if (moduleType === 'pdf') {
      if (!pdfFile) {
        setError('Please upload a PDF file.')
        return
      }
      if (pdfFile.size > 10 * 1024 * 1024) {
        setError('PDF must be under 10 MB.')
        return
      }
      const dataUrl = await readFileAsDataUrl(pdfFile)
      content = { dataUrl, filename: pdfFile.name }
    } else {
      content = { passMark: 70, questions: [] }
    }

    setSaving(true)
    const result = await addQuickModule(courseId, {
      module_type: moduleType,
      title: title.trim(),
      duration,
      content,
    })
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    showToast('Module added to course.')
    resetFields()
    await refresh()
  }

  return (
    <div>
      {toast && <div className="crm-toast"><i className="fa-solid fa-circle-check" /> {toast}</div>}

      <div className="crm-page-head">
        <div>
          <div className="crm-sec-lbl">Academy LMS</div>
          <h2 className="crm-page-title">Quick Content Upload</h2>
        </div>
      </div>

      {(error || coursesError) && (
        <div className="err-box" style={{ marginBottom: 16 }}>{error || coursesError}</div>
      )}

      <div className="crm-card" style={{ maxWidth: 640 }}>
        <p className="crm-lms-muted" style={{ marginBottom: 16 }}>
          Add a single module to an existing course without opening the full course builder.
        </p>

        {loading ? (
          <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /> Loading…</div>
        ) : courses.length === 0 ? (
          <div className="crm-empty">
            <i className="fa-solid fa-book-open" />
            No courses yet. Create a course first.
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <label className="crm-lbl">Course</label>
            <select className="crm-inp" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <label className="crm-lbl" style={{ marginTop: 14 }}>Content Type</label>
            <div className="crm-type-tabs">
              {(['video', 'text', 'pdf', 'quiz'] as ModuleType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`crm-type-tab${moduleType === type ? ' active' : ''}`}
                  onClick={() => setModuleType(type)}
                >
                  <i className={`fa-solid ${MODULE_TYPE_META[type].icon}`} /> {MODULE_TYPE_META[type].label}
                </button>
              ))}
            </div>

            <label className="crm-lbl">
              {moduleType === 'quiz' ? 'Quiz Title' : 'Module Title'}
            </label>
            <input
              className="crm-inp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                moduleType === 'video'
                  ? 'e.g. Introduction to Food Safety'
                  : moduleType === 'text'
                    ? 'e.g. COSHH Overview'
                    : moduleType === 'pdf'
                      ? 'e.g. Safety Data Sheets'
                      : 'e.g. Module Assessment'
              }
            />

            {moduleType === 'video' && (
              <>
                <label className="crm-lbl">YouTube URL</label>
                <input
                  className="crm-inp"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </>
            )}

            {moduleType === 'text' && (
              <>
                <label className="crm-lbl">Content (HTML supported)</label>
                <textarea
                  className="crm-inp crm-textarea"
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  placeholder="Enter text content…"
                />
              </>
            )}

            {moduleType === 'pdf' && (
              <>
                <label className="crm-lbl">Upload PDF (max 10 MB)</label>
                <input
                  className="crm-inp"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </>
            )}

            {moduleType === 'quiz' && (
              <p className="crm-lms-muted" style={{ marginTop: 10 }}>
                Use the full Course Builder to create detailed quizzes with multiple questions.
                A placeholder quiz module will be added here.
              </p>
            )}

            <label className="crm-lbl">Duration</label>
            <input
              className="crm-inp"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30 min"
            />

            <button type="submit" className="crm-btn crm-btn-p" style={{ marginTop: 16 }} disabled={saving}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Adding…</> : <><i className="fa-solid fa-file-circle-plus" /> Add to Course</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
