
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStudent } from '@/lib/hooks/useStudent'
export default function AulasPage() {
  const { student } = useStudent()
  const [lessons, setLessons] = useState<{id:string;title:string;description:string|null;week:number;video_url:string|null}[]>([])
  useEffect(()=>{
    if(!student) return
    const supabase = createClient()
    supabase.from('lessons').select('*').eq('is_active',true).lte('week',student.current_week+1).order('week').order('order_index').then(({data})=>{ if(data) setLessons(data) })
  },[student])
  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-white text-2xl font-bold mb-1">Aulas</h1>
      <p className="text-[#444] text-sm mb-8">Semana {student?.current_week ?? '—'}</p>
      {lessons.length === 0 ? (
        <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-8 text-center">
          <p className="text-4xl mb-4">▶</p>
          <p className="text-white font-bold mb-2">Nenhuma aula disponível</p>
          <p className="text-[#444] text-sm">O treinador ainda não adicionou aulas para sua semana atual.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map(l=>(
            <div key={l.id} className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E10600]/10 border border-[#E10600]/20 flex items-center justify-center text-[#E10600] flex-shrink-0">▶</div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{l.title}</p>
                  {l.description && <p className="text-[#444] text-xs mt-0.5">{l.description}</p>}
                  <p className="text-[#333] text-[10px] mt-1 tracking-widest uppercase">Semana {l.week}</p>
                </div>
                {l.video_url && (
                  <a href={l.video_url} target="_blank" rel="noreferrer"
                    className="text-[#E10600] text-xs font-bold tracking-widest hover:text-[#ff3333] transition-colors">ASSISTIR</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}