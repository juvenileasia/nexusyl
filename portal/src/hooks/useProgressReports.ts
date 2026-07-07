import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PersonProgressReport, Profile, UserRole } from '../types/database'

export function useProgressReports() {
  const [reports, setReports] = useState<PersonProgressReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['student', 'employee'])
      .order('full_name')

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    const people = (profiles as Profile[]) ?? []
    if (people.length === 0) {
      setReports([])
      setLoading(false)
      return
    }

    const profileIds = people.map((p) => p.id)

    const [enrollmentsRes, progressRes] = await Promise.all([
      supabase
        .from('enrollments')
        .select('profile_id, course_id, progress, completed, courses (id, title)')
        .in('profile_id', profileIds),
      supabase
        .from('module_progress')
        .select('profile_id, course_id, module_id, quiz_score, course_modules (title)')
        .in('profile_id', profileIds)
        .not('quiz_score', 'is', null),
    ])

    if (enrollmentsRes.error) {
      setError(enrollmentsRes.error.message)
      setLoading(false)
      return
    }
    if (progressRes.error) {
      setError(progressRes.error.message)
      setLoading(false)
      return
    }

    const quizMap: Record<string, { module_title: string; score: number }[]> = {}
    for (const row of progressRes.data ?? []) {
      const key = `${row.profile_id}:${row.course_id}`
      if (!quizMap[key]) quizMap[key] = []
      const mod = row.course_modules as unknown as { title: string } | { title: string }[] | null
      const title = Array.isArray(mod) ? mod[0]?.title : mod?.title
      quizMap[key].push({
        module_title: title ?? 'Quiz',
        score: row.quiz_score as number,
      })
    }

    const enrollmentMap: Record<string, PersonProgressReport['courses']> = {}
    for (const row of enrollmentsRes.data ?? []) {
      const profileId = row.profile_id as string
      const course = row.courses as unknown as { id: string; title: string } | { id: string; title: string }[] | null
      const courseData = Array.isArray(course) ? course[0] : course
      if (!courseData) continue

      if (!enrollmentMap[profileId]) enrollmentMap[profileId] = []
      const quizKey = `${profileId}:${courseData.id}`
      enrollmentMap[profileId].push({
        course_id: courseData.id,
        course_title: courseData.title,
        progress: row.progress ?? 0,
        completed: row.completed ?? false,
        quiz_scores: quizMap[quizKey] ?? [],
      })
    }

    const result: PersonProgressReport[] = people
      .filter((p) => (enrollmentMap[p.id]?.length ?? 0) > 0)
      .map((p) => ({
        profile: {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          role: p.role as UserRole,
        },
        courses: enrollmentMap[p.id] ?? [],
      }))

    setReports(result)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { reports, loading, error, refresh }
}

export function roleColour(role: UserRole) {
  return role === 'employee' ? '#3b82f6' : '#E8211A'
}
