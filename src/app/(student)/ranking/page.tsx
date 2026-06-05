
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStudent } from '@/lib/hooks/useStudent'
const TURMA_COLOR: Record<string,string> = { Alpha:'#E10600', Bravo:'#4a9eff', Charlie:'#888' }
export default function RankingPage() {
  const { student } = useStudent()
  const [list, setList] = useState<{id:string;name:string;xp:number;turma:string;current_week:number}[]>([])
  useEffect(()=>{
    const supabase = createClient()
    supabase.from('students').select('id,name,xp,turma,current_week').eq('status','active').order('xp',{ascending:false}).limit(50).then(({data})=>{ if(data) setList(data) })
  },[])
  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-white text-2xl font-bold mb-1">Ranking</h1>
      <p className="text-[#444] text-sm mb-6">{list.length} alunos ativos</p>
      <div className="space-y-2">
        {list.map((s,i)=>{
          const isMe = s.id === student?.id
          return (
            <div key={s.id}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 border transition-all ${isMe?'bg-[#1a0505] border-[#E10600]/40':'bg-[#0c0c0c] border-[#161616]'}`}>
              <span className={`w-8 text-center font-black text-sm ${i===0?'text-[#d4a000]':i===1?'text-[#aaa]':i===2?'text-[#c87400]':'text-[#333]'}`}>
                {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isMe?'text-[#E10600]':'text-white'}`}>
                  {s.name}{isMe?' (você)':''}
                </p>
                <p className="text-[#444] text-xs">Semana {s.current_week}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">{s.xp} XP</p>
                <span className="text-[10px] font-bold" style={{color:TURMA_COLOR[s.turma]||'#888'}}>{s.turma}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}