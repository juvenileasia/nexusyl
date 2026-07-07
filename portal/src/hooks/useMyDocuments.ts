import { useCallback, useEffect, useState } from 'react'
import { uploadDocument } from '../lib/documents'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { DocumentRecord } from '../types/database'

export function useMyDocuments(docType?: string) {
  const { profile } = useAuth()
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!profile) {
      setDocuments([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    let query = supabase
      .from('documents')
      .select('*')
      .eq('profile_id', profile.id)
      .order('uploaded_at', { ascending: false })

    if (docType) query = query.eq('doc_type', docType)

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setDocuments((data as DocumentRecord[]) ?? [])
    setLoading(false)
  }, [profile, docType])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function upload(file: File, type: string) {
    if (!profile) return { error: 'Not signed in.' }
    const result = await uploadDocument(profile.id, type, file)
    if (!result.error) await refresh()
    return { error: result.error }
  }

  return { documents, loading, error, refresh, upload }
}
