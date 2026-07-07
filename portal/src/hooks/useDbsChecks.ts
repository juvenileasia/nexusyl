import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { DbsCheckWithProfile, DbsFormData, DbsStats } from '../types/database'

const PROCESSING_STAGES = new Set(['Data Submitted', 'Identity Verified'])
const CLEARED_STAGES = new Set(['Certificate Issued'])
const FLAGGED_STAGES = new Set(['Flagged'])

function stageToDbsStatus(stage: string): string {
  if (CLEARED_STAGES.has(stage)) return 'Cleared'
  if (FLAGGED_STAGES.has(stage)) return 'Flagged'
  if (PROCESSING_STAGES.has(stage)) return 'Processing'
  return 'Not Submitted'
}

function computeStats(checks: DbsCheckWithProfile[]): DbsStats {
  let processing = 0
  let cleared = 0
  let flagged = 0

  for (const check of checks) {
    if (CLEARED_STAGES.has(check.stage)) cleared++
    else if (FLAGGED_STAGES.has(check.stage)) flagged++
    else processing++
  }

  return { total: checks.length, processing, cleared, flagged }
}

export function useDbsChecks() {
  const [checks, setChecks] = useState<DbsCheckWithProfile[]>([])
  const [stats, setStats] = useState<DbsStats>({ total: 0, processing: 0, cleared: 0, flagged: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('dbs_checks')
      .select(
        `
        id, profile_id, role_title, stage, submitted_at, est_clearance,
        certificate_url, notes, created_at, updated_at,
        profiles (id, full_name, email, role)
      `,
      )
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const rows: DbsCheckWithProfile[] = (data ?? []).map((row) => ({
      ...(row as Omit<DbsCheckWithProfile, 'profiles'>),
      profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
    }))

    setChecks(rows)
    setStats(computeStats(rows))
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { checks, stats, loading, error, refresh }
}

export async function saveDbsCheck(
  form: DbsFormData,
  checkId?: string,
  certificateUrl?: string | null,
): Promise<{ error: string | null }> {
  const payload = {
    profile_id: form.profile_id,
    role_title: form.role_title.trim() || null,
    stage: form.stage,
    submitted_at: form.submitted_at || null,
    est_clearance: form.est_clearance || null,
    notes: form.notes.trim() || null,
    ...(certificateUrl !== undefined ? { certificate_url: certificateUrl } : {}),
  }

  if (checkId) {
    const { error } = await supabase.from('dbs_checks').update(payload).eq('id', checkId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('dbs_checks').insert(payload)
    if (error) return { error: error.message }
  }

  const dbsStatus = stageToDbsStatus(form.stage)
  const { error: detailsError } = await supabase
    .from('profile_details')
    .update({ dbs_status: dbsStatus })
    .eq('profile_id', form.profile_id)

  if (detailsError) return { error: detailsError.message }
  return { error: null }
}

export async function deleteDbsCheck(checkId: string, profileId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('dbs_checks').delete().eq('id', checkId)
  if (error) return { error: error.message }

  const { count } = await supabase
    .from('dbs_checks')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)

  if (count === 0) {
    await supabase
      .from('profile_details')
      .update({ dbs_status: 'Not Submitted' })
      .eq('profile_id', profileId)
  }

  return { error: null }
}

export async function fetchDbsCandidates(): Promise<
  { id: string; full_name: string; email: string; role: string; role_title: string | null }[]
> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, profile_details (role_title)')
    .in('role', ['employee', 'student'])
    .order('full_name')

  if (error) throw new Error(error.message)

  return (data ?? []).map((p) => {
    const details = Array.isArray(p.profile_details) ? p.profile_details[0] : p.profile_details
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      role: p.role,
      role_title: (details as { role_title?: string } | null)?.role_title ?? null,
    }
  })
}

export function dbsStagePill(stage: string) {
  if (stage === 'Certificate Issued') return 'pill-g'
  if (stage === 'Identity Verified') return 'pill-y'
  if (stage === 'Flagged') return 'pill-r'
  return 'pill-r'
}
