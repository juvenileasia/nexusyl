import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Application } from './useMyApplication'

export interface PipelineStudent extends Application {
  student?: { full_name: string; email: string } | null
}

export function useSupplierPipeline() {
  const { profile } = useAuth()
  const [students, setStudents] = useState<PipelineStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!profile || profile.role !== 'supplier') {
      setStudents([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('applications')
      .select(
        `
        id, student_id, assigned_to, type, status, title, notes, metadata, created_at, updated_at,
        profiles!applications_student_id_fkey (full_name, email)
      `,
      )
      .eq('assigned_to', profile.id)
      .order('updated_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const rows: PipelineStudent[] = (data ?? []).map((row) => ({
      ...(row as Application),
      student: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
    }))

    setStudents(rows)
    setLoading(false)
  }, [profile])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { students, loading, error, refresh }
}

export function useSupplierStats() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    pipeline: 0,
    inReview: 0,
    approved: 0,
    employeesTraining: 0,
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!profile) return

    setLoading(true)

    const [appsRes, employeesRes] = await Promise.all([
      supabase.from('applications').select('status').eq('assigned_to', profile.id),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }),
    ])

    const apps = appsRes.data ?? []
    setStats({
      pipeline: apps.length,
      inReview: apps.filter((a) => a.status === 'under_review').length,
      approved: apps.filter((a) => ['approved', 'arrived', 'completed'].includes(a.status)).length,
      employeesTraining: employeesRes.count ?? 0,
    })
    setLoading(false)
  }, [profile])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { stats, loading, refresh }
}

export async function fetchEmployeeTrainingOverview() {
  const { data: employees, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, profile_details (role_title)')
    .eq('role', 'employee')
    .order('full_name')

  if (error) throw new Error(error.message)

  const ids = (employees ?? []).map((e) => e.id)
  let enrollmentMap: Record<string, { count: number; avg: number }> = {}

  if (ids.length > 0) {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('profile_id, progress')
      .in('profile_id', ids)

    for (const id of ids) {
      const rows = (enrollments ?? []).filter((e) => e.profile_id === id)
      const count = rows.length
      const avg = count ? Math.round(rows.reduce((s, r) => s + (r.progress ?? 0), 0) / count) : 0
      enrollmentMap[id] = { count, avg }
    }
  }

  return (employees ?? []).map((e) => {
    const details = Array.isArray(e.profile_details) ? e.profile_details[0] : e.profile_details
    const stats = enrollmentMap[e.id] ?? { count: 0, avg: 0 }
    return {
      id: e.id,
      full_name: e.full_name,
      email: e.email,
      role_title: (details as { role_title?: string } | null)?.role_title ?? 'Employee',
      enrollment_count: stats.count,
      avg_progress: stats.avg,
    }
  })
}
