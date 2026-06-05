
'use client'
import { useStudent } from '@/lib/hooks/useStudent'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const RANKS: Record<number,string> = {
  0:'Recruta', 1:'Recruta', 2:'Recruta Operacional',
  3:'Soldado Classe III', 4:'Soldado Classe II', 5:'Soldado Classe I',
  6:'Cabo', 7:'Terceiro-Sargento', 8:'Segundo-Sargento',
  9:'Primeiro-Sargento', 10:'Subtenente', 11:'Aspirante a Oficial',
  12:'Tenente TAF Elite', 13:'Capitão TAF Elite',
}
const TURMA_COLOR: Record<string,string> = { Alpha:'#E10600', Bravo:'#4a9eff', Charlie:'#888' }
const CALENDAR: [string,string][] = [
  ['SEG','Musculação'],['TER','Corrida Leve'],['QUA','Musculação'],
  ['QUI','Tiros'],['SEX','Musculação'],['SAB','Simulado'],['DOM','Descanso'],
]

export default function DashboardPage() {
  const { student, loading } = useStudent()
  const [rankingPos, setRankingPos] = useState<number|null>(null)
  const [total, setTotal] = useState(0)
  const [medals, setMedals] = useState<{name:string}[]>([])

  useEffect(() => {
    if (!student) return
    const supabase = createClient()
    ;(async () => {
      const { data: all } = await supabase.from('students').select('id,xp').eq('status','active').order('xp',{ ascending:false })
      if (all) { setTotal(all.length); setRankingPos(all.findIndex(s=>s.id===student.id)+1) }
      const { data: sm } = await supabase.from('student_medals').select('medals(name)').eq('student_id',student.id)
      if (sm) setMedals(sm.map((r:any)=>r.medals).filter(Boolean))
    })()
  }, [student])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#E10600] text-sm tracking-[.3em] animate-pulse">CARREGANDO...</p>
    </div>
  )
  if (!student) return null

  const rank = RANKS[student.current_week] ?? 'Recruta'
  const progress = Math.round((student.current_week/12)*100)
  const tc = TURMA_COLOR[student.turma]
  const dayIdx = new Date().getDay() // 0=dom
  const todayKey = ['DOM','SEG','TER','QUA','QUI','SEX','SAB'][dayIdx]
  const todayActivity = CALENDAR.find(([d])=>d===todayKey)?.[1] ?? 'Treino'

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="text-[#444] text-xs tracking-[.25em] uppercase">Bem-vindo de volta</p>
          <h1 className="text-white text-2xl font-bold mt-0.5">{student.name.split(' ')[0]}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color:tc, borderColor:tc+'44', background:tc+'12' }}>{student.turma}</span>
            <span className="text-[#333] text-xs">·</span>
            <span className="text-[#555] text-xs">{rank}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#E10600] font-black text-3xl leading-none">{student.xp}</p>
          <p className="text-[#444] text-[10px] tracking-widest uppercase mt-1">XP Total</p>
        </div>
      </div>

      {/* CTA Missão do Dia */}
      <div className="relative rounded-2xl p-5 overflow-hidden flex items-center justify-between"
        style={{ background:'linear-gradient(135deg, #c20000 0%, #E10600 50%, #ff2a00 100%)', boxShadow:'0 8px 32px rgba(225,6,0,.35)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:'linear-gradient(45deg,#fff 1px,transparent 1px),linear-gradient(-45deg,#fff 1px,transparent 1px)', backgroundSize:'20px 20px' }} />
        <div className="relative">
          <p className="text-red-200 text-[10px] tracking-[.3em] uppercase mb-0.5">Missão de Hoje · {todayKey}</p>
          <p className="text-white font-black text-xl">{todayActivity}</p>
          <p className="text-red-200 text-xs mt-0.5">Semana {student.current_week} de 12</p>
        </div>
        <Link href={todayActivity.toLowerCase().includes('corrida')||todayActivity==='Tiros'||todayActivity==='Simulado'?'/corridas':'/treinos'}
          className="relative bg-white text-[#E10600] font-black text-xs tracking-widest px-5 py-3 rounded-xl hover:bg-red-50 transition-colors">
          INICIAR ▸
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Semana',    value:`${student.current_week} / 12`, sub:'atual' },
          { label:'Progresso', value:`${progress}%`,                sub:'concluído' },
          { label:'Ranking',   value:rankingPos?`#${rankingPos}`:'—', sub:`de ${total} alunos` },
          { label:'Patente',   value:rank.split(' ')[0],               sub:rank.split(' ').slice(1).join(' ')||'inicial' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-4">
            <p className="text-[#444] text-[10px] tracking-widest uppercase mb-2">{label}</p>
            <p className="text-white font-black text-lg leading-none">{value}</p>
            <p className="text-[#333] text-[10px] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Progresso */}
      <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[#444] text-[11px] tracking-widest uppercase">Progresso do Programa</p>
          <p className="text-white text-sm font-bold">{progress}%</p>
        </div>
        <div className="h-2 bg-[#161616] rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#E10600] rounded-full transition-all duration-1000"
            style={{ width:`${progress}%`, boxShadow:'0 0 8px rgba(225,6,0,.5)' }} />
        </div>
        <p className="text-[#333] text-xs">Semana {student.current_week} · {rank}</p>
      </div>

      {/* Calendário */}
      <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-5">
        <p className="text-[#444] text-[11px] tracking-widest uppercase mb-4">Calendário Operacional</p>
        <div className="grid grid-cols-7 gap-1.5">
          {CALENDAR.map(([day, act]) => {
            const isToday = day === todayKey
            const isRest = act === 'Descanso'
            return (
              <div key={day}
                className={`rounded-xl p-2 text-center border transition-all ${isToday ? 'border-[#E10600] bg-[#1a0505]' : 'border-[#141414] bg-[#0a0a0a]'}`}>
                <p className={`text-[10px] font-bold mb-1.5 ${isToday?'text-[#E10600]':'text-[#333]'}`}>{day}</p>
                <div className={`w-1.5 h-1.5 rounded-full mx-auto mb-1.5 ${isToday?'bg-[#E10600]':isRest?'bg-[#1a1a1a]':'bg-[#2a1a1a]'}`} />
                <p className={`text-[8px] leading-tight ${isToday?'text-[#E10600]':'text-[#2a2a2a]'}`}>
                  {act.replace('Musculação','Musc.').replace('Simulado','Simul.').replace('Descanso','Desc.')}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Medalhas */}
      {medals.length > 0 && (
        <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-5">
          <p className="text-[#444] text-[11px] tracking-widest uppercase mb-3">Medalhas Conquistadas</p>
          <div className="flex flex-wrap gap-2">
            {medals.map((m,i) => (
              <span key={i} className="bg-[#1a1200] border border-[#3a2a00] text-[#d4a000] text-xs px-3 py-1.5 rounded-full">
                ★ {m.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
