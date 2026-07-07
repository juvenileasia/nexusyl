const RESOURCES = [
  { title: 'UK Right to Work Guidance', icon: 'fa-id-card', url: 'https://www.gov.uk/check-job-applicant-right-to-work' },
  { title: 'DBS Check Information', icon: 'fa-fingerprint', url: 'https://www.gov.uk/dbs-check' },
  { title: 'Food Safety Standards', icon: 'fa-utensils', url: 'https://www.food.gov.uk/' },
  { title: 'Moodle LMS (External)', icon: 'fa-graduation-cap', url: 'https://moodle.org/' },
]

export function EmployeeCompliancePage() {
  return (
    <div>
      <div className="crm-sec-lbl">Compliance</div>
      <h2 className="crm-page-title">Compliance Resources</h2>

      <div className="crm-card">
        <div className="crm-card-title">Reference Links</div>
        <div className="lms-resource-list">
          {RESOURCES.map((r) => (
            <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer" className="lms-resource-item">
              <i className={`fa-solid ${r.icon}`} />
              <span>{r.title}</span>
              <i className="fa-solid fa-arrow-up-right-from-square" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
