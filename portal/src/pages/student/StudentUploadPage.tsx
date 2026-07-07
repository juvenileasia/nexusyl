import { DocumentUploadZone } from '../../components/portal/DocumentUploadZone'
import { useMyDocuments } from '../../hooks/useMyDocuments'

export function StudentUploadPage() {
  const { documents, upload } = useMyDocuments('offer_letter')

  return (
    <div>
      <div className="crm-sec-lbl portal-accent-student">Documents</div>
      <h2 className="crm-page-title">Document Upload</h2>

      <div className="crm-card" style={{ maxWidth: 560 }}>
        <DocumentUploadZone
          label="Offer Letter / Supporting Document"
          hint="PDF or image, max 10 MB"
          onUpload={(file) => upload(file, 'offer_letter')}
        />
      </div>

      {documents.length > 0 && (
        <div className="crm-card" style={{ marginTop: 16 }}>
          <div className="crm-card-title">Uploaded Files</div>
          {documents.map((d) => (
            <div key={d.id} className="lms-doc-row">
              <i className="fa-solid fa-file" />
              <span>{d.file_name}</span>
              <span className="crm-lms-muted">{new Date(d.uploaded_at).toLocaleDateString('en-GB')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
