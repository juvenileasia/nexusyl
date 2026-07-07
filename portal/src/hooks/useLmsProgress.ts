import { supabase } from '../lib/supabase'
import type { CourseModule } from '../types/database'

export interface ModuleProgressRow {
  module_id: string
  completed: boolean
  quiz_score: number | null
}

export async function fetchModuleProgress(
  profileId: string,
  courseId: string,
): Promise<ModuleProgressRow[]> {
  const { data, error } = await supabase
    .from('module_progress')
    .select('module_id, completed, quiz_score')
    .eq('profile_id', profileId)
    .eq('course_id', courseId)

  if (error) throw new Error(error.message)
  return (data ?? []) as ModuleProgressRow[]
}

export async function markModuleComplete(
  profileId: string,
  courseId: string,
  moduleId: string,
  modules: CourseModule[],
  quizScore?: number,
): Promise<{ error: string | null; courseCompleted: boolean }> {
  const { error: progressError } = await supabase.from('module_progress').upsert(
    {
      profile_id: profileId,
      course_id: courseId,
      module_id: moduleId,
      completed: true,
      quiz_score: quizScore ?? null,
      completed_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,module_id' },
  )

  if (progressError) return { error: progressError.message, courseCompleted: false }

  const { data: completedRows, error: countError } = await supabase
    .from('module_progress')
    .select('module_id')
    .eq('profile_id', profileId)
    .eq('course_id', courseId)
    .eq('completed', true)

  if (countError) return { error: countError.message, courseCompleted: false }

  const total = modules.length
  const done = completedRows?.length ?? 0
  const progress = total ? Math.round((done / total) * 100) : 0
  const courseCompleted = total > 0 && done >= total

  const { error: enrollError } = await supabase
    .from('enrollments')
    .update({
      progress,
      completed: courseCompleted,
      completed_at: courseCompleted ? new Date().toISOString() : null,
    })
    .eq('profile_id', profileId)
    .eq('course_id', courseId)

  if (enrollError) return { error: enrollError.message, courseCompleted }

  return { error: null, courseCompleted }
}

export function isModuleDone(progress: ModuleProgressRow[], moduleId: string) {
  return progress.some((p) => p.module_id === moduleId && p.completed)
}

export function courseProgressPercent(progress: ModuleProgressRow[], modules: CourseModule[]) {
  if (!modules.length) return 0
  const done = modules.filter((m) => isModuleDone(progress, m.id)).length
  return Math.round((done / modules.length) * 100)
}
