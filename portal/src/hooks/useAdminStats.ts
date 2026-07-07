import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AdminStats, Course, Profile } from '../types/database'

const emptyStats: AdminStats = {
  courses: 0,
  students: 0,
  employees: 0,
  suppliers: 0,
  recentCourses: [],
  recentPeople: [],
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    const [coursesRes, studentsRes, employeesRes, suppliersRes, recentCoursesRes, recentPeopleRes] =
      await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'employee'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'supplier'),
        supabase
          .from('courses')
          .select('id, title, category, colour, published, created_at, course_modules(count)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .order('created_at', { ascending: false })
          .limit(8),
      ])

    const firstError =
      coursesRes.error ||
      studentsRes.error ||
      employeesRes.error ||
      suppliersRes.error ||
      recentCoursesRes.error ||
      recentPeopleRes.error

    if (firstError) {
      setError(firstError.message)
      setLoading(false)
      return
    }

    setStats({
      courses: coursesRes.count ?? 0,
      students: studentsRes.count ?? 0,
      employees: employeesRes.count ?? 0,
      suppliers: suppliersRes.count ?? 0,
      recentCourses: (recentCoursesRes.data as Course[]) ?? [],
      recentPeople: (recentPeopleRes.data as Profile[]) ?? [],
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { stats, loading, error, refresh }
}
