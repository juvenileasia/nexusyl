import { useEffect, useState } from 'react'
import { fetchEmployeeTrainingOverview } from '../../hooks/useSupplierData'

export function SupplierEmployeesPage() {
  const [employees, setEmployees] = useState<Awaited<ReturnType<typeof fetchEmployeeTrainingOverview>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployeeTrainingOverview()
      .then(setEmployees)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="crm-sec-lbl portal-accent-supplier">Training</div>
      <h2 className="crm-page-title">Employee Training Overview</h2>
      <p className="crm-lms-muted" style={{ marginBottom: 16 }}>Read-only view of Nexusyl employee training progress.</p>

      <div className="crm-card">
        {loading ? (
          <div className="crm-empty"><i className="fa-solid fa-spinner fa-spin" /></div>
        ) : employees.length === 0 ? (
          <div className="crm-empty">No employees found.</div>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Courses</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.full_name}</strong></td>
                    <td>{e.role_title}</td>
                    <td>{e.enrollment_count}</td>
                    <td>
                      <div className="crm-progress-cell">
                        <div className="crm-pb"><div className="crm-pb-fill" style={{ width: `${e.avg_progress}%`, background: '#3b82f6' }} /></div>
                        <span>{e.avg_progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
