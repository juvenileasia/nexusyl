interface PlaceholderPageProps {
  title: string
  icon: string
  phase: string
}

export function PlaceholderPage({ title, icon, phase }: PlaceholderPageProps) {
  return (
    <div>
      <div className="crm-sec-lbl">{phase}</div>
      <h2 className="crm-page-title">{title}</h2>
      <div className="crm-placeholder">
        <i className={`fa-solid ${icon}`} />
        <p>
          <strong>{title}</strong> will be migrated from the legacy HTML dashboard in the next
          phase.
        </p>
        <p style={{ marginTop: 8, fontSize: '0.82rem' }}>Data will load from Supabase.</p>
      </div>
    </div>
  )
}
