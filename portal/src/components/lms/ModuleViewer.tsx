import type { CourseModule, VideoContent, TextContent, PdfContent } from '../../types/database'
import { QuizPlayer } from './QuizPlayer'

interface ModuleViewerProps {
  module: CourseModule
  coursePassMark: number
  isDone: boolean
  quizScore: number | null
  onMarkComplete: () => Promise<void>
  onQuizComplete: (score: number) => Promise<void>
}

export function ModuleViewer({
  module,
  coursePassMark,
  isDone,
  quizScore,
  onMarkComplete,
  onQuizComplete,
}: ModuleViewerProps) {
  return (
    <div className="lms-module-view">
      <div className="lms-module-hd">
        <h2>{module.title}</h2>
        <span className="crm-lms-muted">{module.module_type} · {module.duration ?? '—'}</span>
      </div>

      {module.module_type === 'video' && <VideoBlock content={module.content as VideoContent} />}
      {module.module_type === 'text' && <TextBlock content={module.content as TextContent} />}
      {module.module_type === 'pdf' && <PdfBlock content={module.content as PdfContent} />}
      {module.module_type === 'quiz' && (
        <QuizPlayer
          module={module}
          existingScore={quizScore}
          passMark={coursePassMark}
          onComplete={onQuizComplete}
        />
      )}

      {module.module_type !== 'quiz' && (
        <div className="lms-module-actions">
          {isDone ? (
            <button type="button" className="crm-btn crm-btn-s" disabled>
              <i className="fa-solid fa-circle-check" /> Module Complete
            </button>
          ) : (
            <button type="button" className="crm-btn crm-btn-p" onClick={() => void onMarkComplete()}>
              <i className="fa-solid fa-check" /> Mark as Complete & Continue
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function VideoBlock({ content }: { content: VideoContent }) {
  const id = content.youtubeId || extractId(content.url ?? '')
  if (!id) {
    return <div className="crm-empty">No video URL configured for this module.</div>
  }
  return (
    <div className="lms-video-wrap">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="Course video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function TextBlock({ content }: { content: TextContent }) {
  return (
    <div
      className="lms-text-content"
      dangerouslySetInnerHTML={{ __html: content.body ?? '<p>No content yet.</p>' }}
    />
  )
}

function PdfBlock({ content }: { content: PdfContent }) {
  if (!content.dataUrl) {
    return (
      <div className="crm-empty">
        <i className="fa-solid fa-file-pdf" />
        No PDF uploaded for this module yet.
      </div>
    )
  }
  return (
    <iframe className="lms-pdf-frame" src={content.dataUrl} title={content.filename ?? 'PDF'} />
  )
}

function extractId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? ''
}
