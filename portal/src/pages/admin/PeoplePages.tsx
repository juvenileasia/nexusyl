import { PeopleManagementPage } from './PeopleManagementPage'

export function StudentsPage() {
  return (
    <PeopleManagementPage
      role="student"
      title="Student Management"
      phase="People"
      addLabel="Add New Student"
    />
  )
}

export function EmployeesPage() {
  return (
    <PeopleManagementPage
      role="employee"
      title="Employee Management"
      phase="People"
      addLabel="Add New Employee"
      avatarColor="#3b82f6"
    />
  )
}

export function SuppliersPage() {
  return (
    <PeopleManagementPage
      role="supplier"
      title="Supplier / Partner Management"
      phase="People"
      addLabel="Add New Supplier"
    />
  )
}
