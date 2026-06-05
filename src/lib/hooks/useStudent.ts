
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export interface StudentData {
  id: string; name: string; sex: 'M'|'F'; turma: 'Alpha'|'Bravo'|'Charlie'
  current_week: number; xp: number; status: string; weight: number|null
  concurso: string|null; initial_run_12min: number|null; started_at: string
  has_gym: boolean; anamnese_done: boolean
}

export function useStudent() {
  const [student, setStudent] = useState<StudentData|null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('students').select('*').eq('user_id', user.id).single()
      setStudent(data)
      setLoading(false)
      if (data) await supabase.from('students').update({ last_access: new Date().toISOString() }).eq('id', data.id)
    }
    load()
  }, [])
  return { student, loading }
}
