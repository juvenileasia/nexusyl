import { supabase } from './supabase'

export const DOCUMENTS_BUCKET = 'documents'
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024

export interface UploadedDocument {
  id: string
  storage_path: string
  file_name: string
}

function buildStoragePath(profileId: string, docType: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${profileId}/${docType}/${Date.now()}_${safeName}`
}

export async function uploadDocument(
  profileId: string,
  docType: string,
  file: File,
  applicationId?: string,
): Promise<{ data: UploadedDocument | null; error: string | null }> {
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { data: null, error: 'File must be under 10 MB.' }
  }

  const storagePath = buildStoragePath(profileId, docType, file.name)

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, { upsert: false, contentType: file.type || undefined })

  if (uploadError) return { data: null, error: uploadError.message }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      profile_id: profileId,
      application_id: applicationId ?? null,
      doc_type: docType,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      file_size: file.size,
      status: 'pending',
    })
    .select('id, storage_path, file_name')
    .single()

  if (error) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath])
    return { data: null, error: error.message }
  }

  return { data: data as UploadedDocument, error: null }
}

export async function getDocumentSignedUrl(
  storagePath: string,
  expiresIn = 3600,
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error) return { url: null, error: error.message }
  return { url: data.signedUrl, error: null }
}

export async function deleteDocumentRecord(
  documentId: string,
  storagePath: string,
): Promise<{ error: string | null }> {
  const { error: storageError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([storagePath])

  if (storageError) return { error: storageError.message }

  const { error } = await supabase.from('documents').delete().eq('id', documentId)
  return { error: error?.message ?? null }
}
