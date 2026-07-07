import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { EnrollmentOverview, EnrollmentWithProfile, Profile, UserRole } from '../types/database'

export function useEnrollments() {
  const [overview, setOverview] = useState<EnrollmentOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    const [coursesRes, enrollmentsRes] = await Promise.all([
      supabase.from('courses').select('id, title, colour').order('title'),
      supabase
        .from('enrollments')
        .select('course_id, profile_id, profiles!inner (role)'),
    ])

    if (coursesRes.error) {
      setError(coursesRes.error.message)
      setLoading(false)
      return
    }
    if (enrollmentsRes.error) {
      setError(enrollmentsRes.error.message)
      setLoading(false)
      return
    }

    const counts: Record<string, { students: number; employees: number }> = {}
    for (const row of enrollmentsRes.data ?? []) {
      const courseId = row.course_id as string
      if (!counts[courseId]) counts[courseId] = { students: 0, employees: 0 }
      const profile = row.profiles as unknown as { role: UserRole } | { role: UserRole }[] | null
      const role = Array.isArray(profile) ? profile[0]?.role : profile?.role
      if (role === 'student') counts[courseId].students++
      else if (role === 'employee') counts[courseId].employees++
    }

    const rows: EnrollmentOverview[] = (coursesRes.data ?? []).map((c) => ({
      course_id: c.id,
      course_title: c.title,
      colour: c.colour,
      student_count: counts[c.id]?.students ?? 0,
      employee_count: counts[c.id]?.employees ?? 0,
    }))

    setOverview(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { overview, loading, error, refresh }
}

export async function fetchPeopleForEnrolment(role: UserRole): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at, updated_at')
    .eq('role', role)
    .order('full_name')

  if (error) throw new Error(error.message)
  return (data as Profile[]) ?? []
}

export async function fetchEnrolledCourseIds(profileId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('profile_id', profileId)

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.course_id)
}

export async function setEnrollmentsForProfile(
  profileId: string,
  courseIds: string[],
): Promise<{ error: string | null }> {
  const { data: current, error: fetchError } = await supabase
    .from('enrollments')
    .select('id, course_id')
    .eq('profile_id', profileId)

  if (fetchError) return { error: fetchError.message }

  const currentIds = (current ?? []).map((r) => r.course_id)
  const toAdd = courseIds.filter((id) => !currentIds.includes(id))
  const toRemove = (current ?? []).filter((r) => !courseIds.includes(r.course_id))

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .in(
        'id',
        toRemove.map((r) => r.id),
      )
    if (error) return { error: error.message }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase.from('enrollments').insert(
      toAdd.map((course_id) => ({
        profile_id: profileId,
        course_id,
        status: 'active',
        progress: 0,
        completed: false,
      })),
    )
    if (error) return { error: error.message }
  }

  return { error: null }
}

export async function bulkEnrol(
  courseId: string,
  roles: Array<'student' | 'employee'>,
): Promise<{ error: string | null; count: number }> {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .in('role', roles)

  if (profileError) return { error: profileError.message, count: 0 }
  if (!profiles?.length) return { error: null, count: 0 }

  const profileIds = profiles.map((p) => p.id)

  const { data: existing, error: existingError } = await supabase
    .from('enrollments')
    .select('profile_id')
    .eq('course_id', courseId)
    .in('profile_id', profileIds)

  if (existingError) return { error: existingError.message, count: 0 }

  const existingSet = new Set((existing ?? []).map((r) => r.profile_id))
  const toInsert = profileIds
    .filter((id) => !existingSet.has(id))
    .map((profile_id) => ({
      profile_id,
      course_id: courseId,
      status: 'active',
      progress: 0,
      completed: false,
    }))

  if (toInsert.length === 0) return { error: null, count: 0 }

  const { error } = await supabase.from('enrollments').insert(toInsert)
  if (error) return { error: error.message, count: 0 }

  return { error: null, count: toInsert.length }
}

export async function fetchCourseEnrollments(
  courseId: string,
): Promise<EnrollmentWithProfile[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(
      `
      id, profile_id, course_id, status, progress, completed, enrolled_at, started_at, completed_at,
      profiles (id, full_name, email, role)
    `,
    )
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    ...(row as Omit<EnrollmentWithProfile, 'profiles'>),
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
  })) as EnrollmentWithProfile[]
}
