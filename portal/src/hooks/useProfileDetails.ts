import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { ProfileDetails } from '../types/database'

export function useProfileDetails() {
  const { profile } = useAuth()
  const [details, setDetails] = useState<ProfileDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!profile) {
      setDetails(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data } = await supabase
      .from('profile_details')
      .select('profile_id, phone, role_title, organisation, dbs_status, students_supplied')
      .eq('profile_id', profile.id)
      .maybeSingle()

    setDetails((data as ProfileDetails) ?? null)
    setLoading(false)
  }, [profile])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { details, loading, refresh }
}
