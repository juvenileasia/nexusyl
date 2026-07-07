import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { CourseModule, CourseWithModules, Enrollment } from '../types/database'

export interface EnrolledCourse extends CourseWithModules {
  enrollment: Enrollment
}

export function useMyEnrollments() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!profile) {
      setCourses([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('enrollments')
      .select(
        `
        id, profile_id, course_id, status, progress, completed, enrolled_at, started_at, completed_at,
        courses (
          id, title, description, category, duration_hours, colour, pass_mark, published, created_at,
          course_modules (id, course_id, sort_order, module_type, title, duration, content)
        )
      `,
      )
      .eq('profile_id', profile.id)
      .order('enrolled_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const merged = (data ?? [])
      .map((row) => {
        const course = row.courses as unknown as Omit<CourseWithModules, 'enrollment_count' | 'course_modules'> & {
          course_modules: CourseModule[] | null
        } | null
        if (!course) return null
        const modules = (course.course_modules ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
        const enrolled: EnrolledCourse = {
          ...course,
          course_modules: modules,
          enrollment_count: 0,
          enrollment: {
            id: row.id,
            profile_id: row.profile_id,
            course_id: row.course_id,
            status: row.status,
            progress: row.progress,
            completed: row.completed,
            enrolled_at: row.enrolled_at,
            started_at: row.started_at,
            completed_at: row.completed_at,
          },
        }
        return enrolled
      })
      .filter((c): c is EnrolledCourse => c !== null)

    setCourses(merged)
    setLoading(false)
  }, [profile])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const avgProgress = courses.length
    ? Math.round(courses.reduce((s, c) => s + c.enrollment.progress, 0) / courses.length)
    : 0
  const completedCount = courses.filter((c) => c.enrollment.completed).length

  return { courses, loading, error, refresh, avgProgress, completedCount }
}
