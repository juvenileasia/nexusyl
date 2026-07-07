export type UserRole = 'admin' | 'employee' | 'student' | 'supplier'
export type ModuleType = 'video' | 'text' | 'pdf' | 'quiz'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface ProfileDetails {
  profile_id: string
  phone: string | null
  role_title: string | null
  organisation: string | null
  dbs_status: string
  students_supplied: number
}

export interface Course {
  id: string
  title: string
  description: string | null
  category: string | null
  duration_hours: number | null
  colour: string
  pass_mark: number
  published: boolean
  created_at: string
  course_modules?: { count: number }[]
}

export interface CourseModule {
  id: string
  course_id: string
  sort_order: number
  module_type: ModuleType
  title: string
  duration: string | null
  content: Record<string, unknown>
}

export interface Enrollment {
  id: string
  profile_id: string
  course_id: string
  status: string
  progress: number
  completed: boolean
  enrolled_at: string
  started_at?: string
  completed_at?: string | null
}

export interface CourseWithModules extends Omit<Course, 'course_modules'> {
  course_modules: CourseModule[]
  enrollment_count: number
}

export interface VideoContent {
  youtubeId?: string
  url?: string
}

export interface TextContent {
  body?: string
}

export interface PdfContent {
  dataUrl?: string
  filename?: string
}

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  text: string
  options: QuizOption[]
  correct: string
}

export interface QuizContent {
  passMark?: number
  questions: QuizQuestion[]
}

export type ModuleContent = VideoContent | TextContent | PdfContent | QuizContent

export interface ModuleDraft {
  id?: string
  module_type: ModuleType
  title: string
  duration: string
  content: ModuleContent
}

export interface CourseFormData {
  title: string
  description: string
  category: string
  colour: string
  pass_mark: number
  published: boolean
  modules: ModuleDraft[]
}

export interface EnrollmentOverview {
  course_id: string
  course_title: string
  colour: string
  student_count: number
  employee_count: number
}

export interface EnrollmentWithProfile extends Enrollment {
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'role'>
}

export interface DbsCheck {
  id: string
  profile_id: string
  role_title: string | null
  stage: string
  submitted_at: string | null
  est_clearance: string | null
  certificate_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DbsCheckWithProfile extends DbsCheck {
  profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'role'>
}

export interface DbsStats {
  total: number
  processing: number
  cleared: number
  flagged: number
}

export interface DbsFormData {
  profile_id: string
  role_title: string
  stage: string
  submitted_at: string
  est_clearance: string
  notes: string
}

export interface DocumentRecord {
  id: string
  profile_id: string
  application_id: string | null
  doc_type: string
  file_name: string
  storage_path: string
  mime_type: string | null
  file_size: number | null
  status: string
  uploaded_at: string
}

export interface CourseProgressRow {
  course_id: string
  course_title: string
  progress: number
  completed: boolean
  quiz_scores: { module_title: string; score: number }[]
}

export interface PersonProgressReport {
  profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'role'>
  courses: CourseProgressRow[]
}

export const DBS_STAGES = [
  'Data Submitted',
  'Identity Verified',
  'Certificate Issued',
  'Flagged',
] as const

export type DbsStage = (typeof DBS_STAGES)[number]

export const DOCUMENT_TYPES = [
  'offer_letter',
  'passport',
  'cas',
  'dbs_certificate',
  'right_to_work',
  'other',
] as const

export const COURSE_CATEGORIES = ['Compliance', 'Safety', 'Student', 'Onboarding'] as const

export const COURSE_COLOURS = ['#E8211A', '#2563eb', '#22c55e', '#eab308', '#a855f7', '#ec4899'] as const

export const MODULE_TYPE_META: Record<
  ModuleType,
  { icon: string; colour: string; pill: string; label: string }
> = {
  video: { icon: 'fa-play', colour: '#E8211A', pill: 'pill-r', label: 'Video' },
  text: { icon: 'fa-align-left', colour: '#2563eb', pill: 'pill-b', label: 'Text' },
  pdf: { icon: 'fa-file-pdf', colour: '#d97706', pill: 'pill-y', label: 'PDF' },
  quiz: { icon: 'fa-list-check', colour: '#16a34a', pill: 'pill-g', label: 'Quiz' },
}

export interface AdminStats {
  courses: number
  students: number
  employees: number
  suppliers: number
  recentCourses: Course[]
  recentPeople: Profile[]
}

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  admin: '/dashboard-admin',
  employee: '/dashboard-employee',
  student: '/dashboard-student',
  supplier: '/dashboard-supplier',
}
