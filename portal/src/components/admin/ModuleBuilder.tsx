import { extractYoutubeId } from '../../lib/youtube'
import type { ModuleDraft, ModuleType, QuizContent } from '../../types/database'
import { MODULE_TYPE_META } from '../../types/database'

interface ModuleBuilderProps {
  modules: ModuleDraft[]
  onChange: (modules: ModuleDraft[]) => void
}

export function ModuleBuilder({ modules, onChange }: ModuleBuilderProps) {
  function updateModule(index: number, patch: Partial<ModuleDraft>) {
    const next = modules.map((m, i) => (i === index ? { ...m, ...patch } : m))
    onChange(next)
  }

  function updateContent(index: number, patch: Record<string, unknown>) {
    const next = modules.map((m, i) =>
      i === index ? { ...m, content: { ...m.content, ...patch } } : m,
    )
    onChange(next)
  }

  function removeModule(index: number) {
    onChange(modules.filter((_, i) => i !== index))
  }

  function addModule(type: ModuleType) {
    const defaults: Record<ModuleType, () => ModuleDraft> = {
      video: () => ({
        module_type: 'video',
        title: 'Video Module',
        duration: '30 min',
        content: { youtubeId: '', url: '' },
      }),
      text: () => ({
        module_type: 'text',
        title: 'Text Module',
        duration: '20 min',
        content: { body: '' },
      }),
      pdf: () => ({
        module_type: 'pdf',
        title: 'PDF Module',
        duration: '15 min',
        content: { dataUrl: '', filename: '' },
      }),
      quiz: () => ({
        module_type: 'quiz',
        title: 'Quiz Module',
        duration: '10 min',
        content: { passMark: 70, questions: [] },
      }),
    }
    onChange([...modules, defaults[type]()])
  }

  function addQuestion(moduleIndex: number) {
    const mod = modules[moduleIndex]
    const quiz = mod.content as QuizContent
    const questions = [
      ...(quiz.questions ?? []),
      {
        id: `q${Date.now()}`,
        text: '',
        options: [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
          { id: 'c', text: '' },
          { id: 'd', text: '' },
        ],
        correct: 'a',
      },
    ]
    updateContent(moduleIndex, { questions })
  }

  function removeQuestion(moduleIndex: number, questionIndex: number) {
    const mod = modules[moduleIndex]
    const quiz = mod.content as QuizContent
    updateContent(moduleIndex, {
      questions: quiz.questions.filter((_, i) => i !== questionIndex),
    })
  }

  function updateQuestion(
    moduleIndex: number,
    questionIndex: number,
    patch: Partial<QuizContent['questions'][0]>,
  ) {
    const mod = modules[moduleIndex]
    const quiz = mod.content as QuizContent
    const questions = quiz.questions.map((q, i) =>
      i === questionIndex ? { ...q, ...patch } : q,
    )
    updateContent(moduleIndex, { questions })
  }

  function updateOption(
    moduleIndex: number,
    questionIndex: number,
    optionId: string,
    text: string,
  ) {
    const mod = modules[moduleIndex]
    const quiz = mod.content as QuizContent
    const questions = quiz.questions.map((q, i) => {
      if (i !== questionIndex) return q
      return {
        ...q,
        options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
      }
    })
    updateContent(moduleIndex, { questions })
  }

  async function handlePdfUpload(index: number, file: File | null) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('PDF must be under 10 MB.')
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    updateContent(index, { dataUrl, filename: file.name })
  }

  return (
    <div>
      <div className="crm-lms-mod-actions">
        {(['video', 'text', 'pdf', 'quiz'] as ModuleType[]).map((type) => (
          <button
            key={type}
            type="button"
            className="crm-btn crm-btn-s crm-btn-xs"
            onClick={() => addModule(type)}
          >
            <i className={`fa-solid ${MODULE_TYPE_META[type].icon}`} /> {MODULE_TYPE_META[type].label}
          </button>
        ))}
      </div>

      {modules.length === 0 ? (
        <div className="crm-lms-mod-empty">
          <i className="fa-solid fa-puzzle-piece" />
          No modules yet. Add video, text, PDF, or quiz content above.
        </div>
      ) : (
        modules.map((mod, i) => {
          const meta = MODULE_TYPE_META[mod.module_type]
          return (
            <div key={mod.id ?? `draft-${i}`} className="crm-mod-row">
              <div className="crm-mod-row-hd">
                <div className="crm-mod-icon" style={{ background: `${meta.colour}22` }}>
                  <i className={`fa-solid ${meta.icon}`} style={{ color: meta.colour }} />
                </div>
                <input
                  className="crm-inp"
                  value={mod.title}
                  onChange={(e) => updateModule(i, { title: e.target.value })}
                  placeholder="Module title"
                />
                <button
                  type="button"
                  className="crm-btn crm-btn-d crm-btn-xs"
                  onClick={() => removeModule(i)}
                  title="Remove module"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>

              {mod.module_type === 'video' && (
                <div className="crm-form-row">
                  <div>
                    <label className="crm-lbl">YouTube URL</label>
                    <input
                      className="crm-inp"
                      value={(mod.content as { url?: string }).url ?? ''}
                      placeholder="https://youtube.com/watch?v=..."
                      onChange={(e) => {
                        const url = e.target.value
                        updateContent(i, { url, youtubeId: extractYoutubeId(url) })
                      }}
                    />
                  </div>
                  <div>
                    <label className="crm-lbl">Duration</label>
                    <input
                      className="crm-inp"
                      value={mod.duration}
                      onChange={(e) => updateModule(i, { duration: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {mod.module_type === 'text' && (
                <>
                  <label className="crm-lbl">Content (HTML supported)</label>
                  <textarea
                    className="crm-inp crm-textarea"
                    value={(mod.content as { body?: string }).body ?? ''}
                    placeholder="Text content — <h3>, <p>, <ul> supported."
                    onChange={(e) => updateContent(i, { body: e.target.value })}
                  />
                  <label className="crm-lbl">Duration</label>
                  <input
                    className="crm-inp"
                    value={mod.duration}
                    onChange={(e) => updateModule(i, { duration: e.target.value })}
                  />
                </>
              )}

              {mod.module_type === 'pdf' && (
                <>
                  <label className="crm-lbl">Upload PDF (max 10 MB)</label>
                  <input
                    className="crm-inp"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => void handlePdfUpload(i, e.target.files?.[0] ?? null)}
                  />
                  {(mod.content as { filename?: string }).filename && (
                    <div className="crm-lms-file-ok">
                      <i className="fa-solid fa-circle-check" />{' '}
                      {(mod.content as { filename?: string }).filename}
                    </div>
                  )}
                  <label className="crm-lbl">Duration</label>
                  <input
                    className="crm-inp"
                    value={mod.duration}
                    onChange={(e) => updateModule(i, { duration: e.target.value })}
                  />
                </>
              )}

              {mod.module_type === 'quiz' && (
                <>
                  <div className="crm-lms-quiz-hd">
                    <label className="crm-lbl" style={{ margin: 0 }}>
                      Questions ({(mod.content as QuizContent).questions?.length ?? 0})
                    </label>
                    <button
                      type="button"
                      className="crm-btn crm-btn-s crm-btn-xs"
                      onClick={() => addQuestion(i)}
                    >
                      <i className="fa-solid fa-plus" /> Add Question
                    </button>
                  </div>

                  {(mod.content as QuizContent).questions?.map((q, qi) => (
                    <div key={q.id} className="crm-q-block">
                      <input
                        className="crm-inp"
                        value={q.text}
                        placeholder={`Question ${qi + 1}…`}
                        onChange={(e) => updateQuestion(i, qi, { text: e.target.value })}
                      />
                      {q.options.map((o) => (
                        <div key={o.id} className="crm-opt-row">
                          <input
                            type="radio"
                            name={`q-${i}-${qi}`}
                            checked={q.correct === o.id}
                            onChange={() => updateQuestion(i, qi, { correct: o.id })}
                          />
                          <input
                            className="crm-inp"
                            value={o.text}
                            placeholder={`Option ${o.id.toUpperCase()}…`}
                            onChange={(e) => updateOption(i, qi, o.id, e.target.value)}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="crm-btn crm-btn-d crm-btn-xs"
                        onClick={() => removeQuestion(i, qi)}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  ))}

                  <label className="crm-lbl">Pass Mark (%)</label>
                  <input
                    className="crm-inp"
                    type="number"
                    min={1}
                    max={100}
                    style={{ maxWidth: 100 }}
                    value={(mod.content as QuizContent).passMark ?? 70}
                    onChange={(e) =>
                      updateContent(i, { passMark: parseInt(e.target.value, 10) || 70 })
                    }
                  />
                </>
              )}
            </div>
          )
        })
      )}
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
