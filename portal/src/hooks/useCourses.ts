import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  CourseFormData,
  CourseModule,
  CourseWithModules,
  ModuleDraft,
  ModuleType,
} from '../types/database'

function defaultModuleContent(type: ModuleType): ModuleDraft['content'] {
  switch (type) {
    case 'video':
      return { youtubeId: '', url: '' }
    case 'text':
      return { body: '' }
    case 'pdf':
      return { dataUrl: '', filename: '' }
    case 'quiz':
      return { passMark: 70, questions: [] }
  }
}

export function createEmptyModule(type: ModuleType): ModuleDraft {
  return {
    module_type: type,
    title: `${type.charAt(0).toUpperCase()}${type.slice(1)} Module`,
    duration: '30 min',
    content: defaultModuleContent(type),
  }
}

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseWithModules[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data: courseRows, error: courseError } = await supabase
      .from('courses')
      .select(
        `
        id, title, description, category, duration_hours, colour, pass_mark, published, created_at,
        course_modules (id, course_id, sort_order, module_type, title, duration, content)
      `,
      )
      .order('created_at', { ascending: false })

    if (courseError) {
      setError(courseError.message)
      setLoading(false)
      return
    }

    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('course_id')

    if (enrollError) {
      setError(enrollError.message)
      setLoading(false)
      return
    }

    const countMap: Record<string, number> = {}
    for (const row of enrollments ?? []) {
      countMap[row.course_id] = (countMap[row.course_id] ?? 0) + 1
    }

    const merged: CourseWithModules[] = (courseRows ?? []).map((c) => {
      const modules = (c.course_modules as CourseModule[] | null) ?? []
      modules.sort((a, b) => a.sort_order - b.sort_order)
      return {
        ...(c as Omit<CourseWithModules, 'course_modules' | 'enrollment_count'>),
        course_modules: modules,
        enrollment_count: countMap[c.id] ?? 0,
      }
    })

    setCourses(merged)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { courses, loading, error, refresh }
}

export async function saveCourse(
  form: CourseFormData,
  courseId?: string,
): Promise<{ error: string | null; courseId?: string }> {
  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    category: form.category,
    colour: form.colour,
    pass_mark: form.pass_mark,
    published: form.published,
  }

  let id = courseId

  if (courseId) {
    const { error } = await supabase.from('courses').update(payload).eq('id', courseId)
    if (error) return { error: error.message }
  } else {
    const { data, error } = await supabase.from('courses').insert(payload).select('id').single()
    if (error) return { error: error.message }
    id = data.id
  }

  if (!id) return { error: 'Course ID missing after save.' }

  const moduleResult = await syncCourseModules(id, form.modules)
  if (moduleResult.error) return { error: moduleResult.error }

  return { error: null, courseId: id }
}

async function syncCourseModules(
  courseId: string,
  modules: ModuleDraft[],
): Promise<{ error: string | null }> {
  const { data: existing, error: fetchError } = await supabase
    .from('course_modules')
    .select('id')
    .eq('course_id', courseId)

  if (fetchError) return { error: fetchError.message }

  const keepIds = modules.map((m) => m.id).filter((id): id is string => Boolean(id && isUuid(id)))
  const toDelete = (existing ?? [])
    .map((m) => m.id)
    .filter((id) => !keepIds.includes(id))

  if (toDelete.length > 0) {
    const { error } = await supabase.from('course_modules').delete().in('id', toDelete)
    if (error) return { error: error.message }
  }

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]
    const row = {
      course_id: courseId,
      sort_order: i + 1,
      module_type: mod.module_type,
      title: mod.title.trim() || 'Untitled Module',
      duration: mod.duration.trim() || null,
      content: mod.content,
    }

    if (mod.id && isUuid(mod.id)) {
      const { error } = await supabase.from('course_modules').update(row).eq('id', mod.id)
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase.from('course_modules').insert(row)
      if (error) return { error: error.message }
    }
  }

  return { error: null }
}

export async function deleteCourse(courseId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('courses').delete().eq('id', courseId)
  return { error: error?.message ?? null }
}

export async function addQuickModule(
  courseId: string,
  module: Omit<ModuleDraft, 'id'>,
): Promise<{ error: string | null }> {
  const { data: last, error: countError } = await supabase
    .from('course_modules')
    .select('sort_order')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: false })
    .limit(1)

  if (countError) return { error: countError.message }

  const nextOrder = (last?.[0]?.sort_order ?? 0) + 1

  const { error } = await supabase.from('course_modules').insert({
    course_id: courseId,
    sort_order: nextOrder,
    module_type: module.module_type,
    title: module.title.trim() || 'Untitled Module',
    duration: module.duration.trim() || null,
    content: module.content,
  })

  return { error: error?.message ?? null }
}

export function courseToFormData(course: CourseWithModules): CourseFormData {
  return {
    title: course.title,
    description: course.description ?? '',
    category: course.category ?? 'Compliance',
    colour: course.colour,
    pass_mark: course.pass_mark,
    published: course.published,
    modules: course.course_modules.map((m) => ({
      id: m.id,
      module_type: m.module_type,
      title: m.title,
      duration: m.duration ?? '30 min',
      content: m.content as ModuleDraft['content'],
    })),
  }
}
