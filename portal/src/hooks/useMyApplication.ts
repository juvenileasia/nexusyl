import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface Application {
  id: string
  student_id: string | null
  assigned_to: string | null
  type: string
  status: string
  title: string
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export const TRACKER_STAGES = [
  'Application Submitted',
  'Documents Required',
  'Under Review',
  'Visa Approved',
  'Arrived in UK',
] as const

const STATUS_STAGE: Record<string, number> = {
  pending: 0,
  documents_required: 1,
  under_review: 2,
  approved: 3,
  arrived: 4,
  completed: 4,
}

export function stageIndex(status: string, metadata?: Record<string, unknown>) {
  if (typeof metadata?.current_stage === 'number') return metadata.current_stage as number
  return STATUS_STAGE[status] ?? 0
}

export function useMyApplication() {
  const { profile } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!profile || profile.role !== 'student') {
      setApplication(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setApplication((data as Application) ?? null)
    setLoading(false)
  }, [profile])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { application, loading, error, refresh, currentStage: application ? stageIndex(application.status, application.metadata) : 0 }
}
