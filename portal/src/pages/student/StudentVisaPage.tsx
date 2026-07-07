import { DocumentUploadZone } from '../../components/portal/DocumentUploadZone'
import { useMyDocuments } from '../../hooks/useMyDocuments'

const VISA_TYPES = [
  { type: 'passport', label: 'Passport Copy' },
  { type: 'cas', label: 'CAS Letter' },
] as const

export function StudentVisaPage() {
  const { documents, upload } = useMyDocuments()

  const visaDocs = documents.filter((d) => d.doc_type === 'passport' || d.doc_type === 'cas')

  return (
    <div>
      <div className="crm-sec-lbl portal-accent-student">Documents</div>
      <h2 className="crm-page-title">Visa Documents</h2>

      <div className="crm-enrol-grid">
        {VISA_TYPES.map((v) => (
          <div key={v.type} className="crm-card">
            <DocumentUploadZone
              label={v.label}
              hint="PDF or image, max 10 MB"
              onUpload={(file) => upload(file, v.type)}
            />
          </div>
        ))}
      </div>

      {visaDocs.length > 0 && (
        <div className="crm-card" style={{ marginTop: 16 }}>
          <div className="crm-card-title">Uploaded Visa Documents</div>
          {visaDocs.map((d) => (
            <div key={d.id} className="lms-doc-row">
              <i className="fa-solid fa-passport" />
              <span>{d.file_name}</span>
              <span className="crm-pill pill-b">{d.doc_type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
