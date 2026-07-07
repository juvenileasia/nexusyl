interface CertificateModalProps {
  open: boolean
  studentName: string
  courseTitle: string
  onClose: () => void
}

export function CertificateModal({ open, studentName, courseTitle, onClose }: CertificateModalProps) {
  if (!open) return null

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="crm-modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal crm-modal-lg">
        <div className="crm-modal-hd">
          <strong>Certificate of Completion</strong>
          <button type="button" className="crm-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="crm-modal-bd">
          <div className="lms-cert">
            <div className="lms-cert-border" />
            <div className="lms-cert-brand">Nexusyl Academy</div>
            <div className="lms-cert-sub">Certificate of Completion</div>
            <p className="lms-cert-present">This is to certify that</p>
            <div className="lms-cert-name">{studentName}</div>
            <p className="lms-cert-present">has successfully completed</p>
            <div className="lms-cert-course">{courseTitle}</div>
            <p className="lms-cert-date">{date}</p>
          </div>
        </div>
        <div className="crm-modal-ft">
          <button type="button" className="crm-btn crm-btn-s" onClick={onClose}>Close</button>
          <button type="button" className="crm-btn crm-btn-p" onClick={() => window.print()}>
            <i className="fa-solid fa-print" /> Print
          </button>
        </div>
      </div>
    </div>
  )
}
