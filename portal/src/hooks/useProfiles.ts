import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, ProfileDetails, UserRole } from '../types/database'

export interface ProfileWithDetails extends Profile {
  profile_details: ProfileDetails | null
  enrollment_count: number
  avg_progress: number
  completed_count: number
}

export interface PersonFormData {
  full_name: string
  email: string
  phone: string
  role_title: string
  organisation: string
  dbs_status: string
  students_supplied: number
  password: string
  must_change_pass: boolean
}

export function useProfiles(role: UserRole) {
  const [people, setPeople] = useState<ProfileWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(
        `
        id, email, full_name, role, created_at, updated_at,
        profile_details (
          profile_id, phone, role_title, organisation, dbs_status, students_supplied, must_change_pass
        )
      `,
      )
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    const ids = (profiles ?? []).map((p) => p.id)
    let enrollmentMap: Record<string, { count: number; avg: number; completed: number }> = {}

    if (ids.length > 0) {
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('profile_id, progress, completed')
        .in('profile_id', ids)

      if (enrollError) {
        setError(enrollError.message)
        setLoading(false)
        return
      }

      for (const id of ids) {
        const rows = (enrollments ?? []).filter((e) => e.profile_id === id)
        const count = rows.length
        const avg = count ? Math.round(rows.reduce((s, r) => s + (r.progress ?? 0), 0) / count) : 0
        const completed = rows.filter((r) => r.completed).length
        enrollmentMap[id] = { count, avg, completed }
      }
    }

    const merged: ProfileWithDetails[] = (profiles ?? []).map((p) => {
      const stats = enrollmentMap[p.id] ?? { count: 0, avg: 0, completed: 0 }
      const details = Array.isArray(p.profile_details)
        ? p.profile_details[0] ?? null
        : p.profile_details

      return {
        ...(p as Profile),
        profile_details: details as ProfileDetails | null,
        enrollment_count: stats.count,
        avg_progress: stats.avg,
        completed_count: stats.completed,
      }
    })

    setPeople(merged)
    setLoading(false)
  }, [role])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { people, loading, error, refresh }
}

export async function createPortalUser(
  role: UserRole,
  form: PersonFormData,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_create_portal_user', {
    p_email: form.email.trim().toLowerCase(),
    p_password: form.password,
    p_full_name: form.full_name.trim(),
    p_role: role,
    p_phone: form.phone.trim() || null,
    p_role_title: form.role_title.trim() || null,
    p_organisation: role === 'supplier' ? form.organisation.trim() || null : null,
    p_dbs_status: role === 'employee' ? form.dbs_status : 'Not Submitted',
    p_students_supplied: role === 'supplier' ? form.students_supplied : 0,
    p_must_change_pass: form.must_change_pass,
  })
  return { error: error?.message ?? null }
}

export async function updatePortalUser(
  userId: string,
  role: UserRole,
  form: Omit<PersonFormData, 'email' | 'password' | 'must_change_pass'>,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_update_portal_user', {
    p_user_id: userId,
    p_full_name: form.full_name.trim(),
    p_phone: form.phone.trim() || null,
    p_role_title: form.role_title.trim() || null,
    p_organisation: role === 'supplier' ? form.organisation.trim() || null : null,
    p_dbs_status: role === 'employee' ? form.dbs_status : null,
    p_students_supplied: role === 'supplier' ? form.students_supplied : null,
  })
  return { error: error?.message ?? null }
}

export async function resetUserPassword(
  userId: string,
  password: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_update_user_password', {
    p_user_id: userId,
    p_password: password,
  })
  return { error: error?.message ?? null }
}

export async function deletePortalUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_delete_portal_user', { p_user_id: userId })
  return { error: error?.message ?? null }
}
