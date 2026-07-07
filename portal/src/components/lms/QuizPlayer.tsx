import { useEffect, useState } from 'react'
import type { CourseModule, QuizContent } from '../../types/database'

interface QuizPlayerProps {
  module: CourseModule
  existingScore: number | null
  passMark: number
  onComplete: (score: number) => Promise<void>
}

export function QuizPlayer({ module, existingScore, passMark, onComplete }: QuizPlayerProps) {
  const content = module.content as unknown as QuizContent
  const questions = content.questions ?? []
  const requiredPass = content.passMark ?? passMark

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [score, setScore] = useState<number | null>(existingScore)
  const [retaking, setRetaking] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setScore(existingScore)
    setRetaking(false)
    setAnswers({})
  }, [module.id, existingScore])

  const showResult = score !== null && !retaking

  if (showResult) {
    const passed = score >= requiredPass
    return (
      <div className="lms-quiz-result">
        <i className={`fa-solid ${passed ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
        <div className="lms-quiz-score">{score}%</div>
        <p>{passed ? 'Passed — well done!' : 'Not quite — you can retake the quiz'}</p>
        {!passed && (
          <button type="button" className="crm-btn crm-btn-s" onClick={() => { setRetaking(true); setScore(null); setAnswers({}) }}>
            <i className="fa-solid fa-rotate-left" /> Retake Quiz
          </button>
        )}
      </div>
    )
  }

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((a) => ({ ...a, [questionId]: optionId }))
  }

  async function handleSubmit() {
    if (questions.some((q) => !answers[q.id])) return
    const correct = questions.filter((q) => answers[q.id] === q.correct).length
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0
    setSaving(true)
    setScore(pct)
    await onComplete(pct)
    setSaving(false)
    setRetaking(false)
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id])

  if (questions.length === 0) {
    return <p className="crm-lms-muted">This quiz has no questions yet.</p>
  }

  return (
    <div>
      {questions.map((q, i) => (
        <div key={q.id} className="crm-q-block">
          <p className="lms-quiz-q">{i + 1}. {q.text}</p>
          {q.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`lms-opt-btn${answers[q.id] === o.id ? ' selected' : ''}`}
              onClick={() => selectAnswer(q.id, o.id)}
            >
              <strong>{o.id.toUpperCase()}.</strong> {o.text}
            </button>
          ))}
        </div>
      ))}
      <button
        type="button"
        className="crm-btn crm-btn-p"
        disabled={!allAnswered || saving}
        onClick={() => void handleSubmit()}
      >
        {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Submitting…</> : <><i className="fa-solid fa-paper-plane" /> Submit Quiz</>}
      </button>
    </div>
  )
}
