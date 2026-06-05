import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
  console.log('✅', path)
}

// ─── HOOK useStudent ───────────────────────────────────────────────────────
write('src/lib/hooks/useStudent.ts', `
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
`)

// ─── SIDEBAR ───────────────────────────────────────────────────────────────
write('src/components/layout/Sidebar.tsx', `
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStudent } from '@/lib/hooks/useStudent'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: '◉', label: 'Dashboard' },
  { href: '/corridas',  icon: '⚡', label: 'Corridas'  },
  { href: '/treinos',   icon: '◈', label: 'Musculação' },
  { href: '/aulas',     icon: '▶', label: 'Aulas'      },
  { href: '/ranking',   icon: '◆', label: 'Ranking'    },
  { href: '/perfil',    icon: '◎', label: 'Perfil'     },
]
const TURMA_COLOR: Record<string,string> = { Alpha:'#E10600', Bravo:'#4a9eff', Charlie:'#888' }

export default function Sidebar() {
  const pathname = usePathname()
  const { student } = useStudent()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#080808] border-r border-[#141414] hidden lg:flex flex-col z-40">
      <div className="p-6 border-b border-[#141414]">
        <div className="flex items-center gap-2">
          <span className="bg-[#E10600] text-white font-black text-lg px-2.5 py-0.5 tracking-widest">TAF</span>
          <span className="text-white font-black text-lg tracking-[.2em]">ELITE</span>
        </div>
        <p className="text-[#333] text-[10px] tracking-[.2em] uppercase mt-1">Plataforma Tática</p>
      </div>
      <nav className="flex-1 p-4 space-y-0.5">
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || (pathname.startsWith(href) && href !== '/dashboard')
          return (
            <Link key={href} href={href}
              className={\`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all \${
                active ? 'bg-[#E10600] text-white shadow-lg' : 'text-[#444] hover:text-white hover:bg-[#111]'
              }\`}>
              <span className="w-5 text-center text-base">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
      {student && (
        <div className="p-4 border-t border-[#141414] space-y-2">
          <div className="bg-[#0f0f0f] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white text-sm font-semibold truncate">{student.name.split(' ')[0]}</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ color: TURMA_COLOR[student.turma], background: TURMA_COLOR[student.turma]+'18' }}>
                {student.turma}
              </span>
            </div>
            <p className="text-[#444] text-xs">{student.xp} XP</p>
          </div>
          <button onClick={handleLogout}
            className="w-full text-[#333] hover:text-[#666] text-xs tracking-widest uppercase py-2 transition-colors">
            Sair
          </button>
        </div>
      )}
    </aside>
  )
}
`)

// ─── MOBILE NAV ────────────────────────────────────────────────────────────
write('src/components/layout/MobileNav.tsx', `
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', icon: '◉', label: 'Início'   },
  { href: '/treinos',   icon: '◈', label: 'Treinos'  },
  { href: '/corridas',  icon: '⚡', label: 'Corridas' },
  { href: '/aulas',     icon: '▶', label: 'Aulas'    },
  { href: '/ranking',   icon: '◆', label: 'Ranking'  },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#080808] border-t border-[#141414] flex lg:hidden z-40 safe-area-pb">
      {NAV.map(({ href, icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href}
            className={\`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors \${active ? 'text-[#E10600]' : 'text-[#3a3a3a]'}\`}>
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[9px] tracking-wide">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
`)

// ─── STUDENT LAYOUT ────────────────────────────────────────────────────────
write('src/app/(student)/layout.tsx', `
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070707] flex">
      <Sidebar />
      <main className="flex-1 lg:pl-64 pb-24 lg:pb-0 min-h-screen">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
`)

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
write('src/app/(student)/dashboard/page.tsx', `
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
          { label:'Semana',    value:\`\${student.current_week} / 12\`, sub:'atual' },
          { label:'Progresso', value:\`\${progress}%\`,                sub:'concluído' },
          { label:'Ranking',   value:rankingPos?\`#\${rankingPos}\`:'—', sub:\`de \${total} alunos\` },
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
            style={{ width:\`\${progress}%\`, boxShadow:'0 0 8px rgba(225,6,0,.5)' }} />
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
                className={\`rounded-xl p-2 text-center border transition-all \${isToday ? 'border-[#E10600] bg-[#1a0505]' : 'border-[#141414] bg-[#0a0a0a]'}\`}>
                <p className={\`text-[10px] font-bold mb-1.5 \${isToday?'text-[#E10600]':'text-[#333]'}\`}>{day}</p>
                <div className={\`w-1.5 h-1.5 rounded-full mx-auto mb-1.5 \${isToday?'bg-[#E10600]':isRest?'bg-[#1a1a1a]':'bg-[#2a1a1a]'}\`} />
                <p className={\`text-[8px] leading-tight \${isToday?'text-[#E10600]':'text-[#2a2a2a]'}\`}>
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
`)

// ─── PÁGINAS RESTANTES ─────────────────────────────────────────────────────
const pages = {
  'src/app/(student)/treinos/page.tsx': `
'use client'
import { useStudent } from '@/lib/hooks/useStudent'
export default function TreinosPage() {
  const { student } = useStudent()
  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-white text-2xl font-bold mb-1">Musculação</h1>
      <p className="text-[#444] text-sm mb-8">Semana {student?.current_week ?? '—'} · Protocolo {student?.has_gym ? 'Academia' : 'Casa'} {student?.sex === 'M' ? 'Masculino' : 'Feminino'}</p>
      <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-8 text-center">
        <p className="text-4xl mb-4">◈</p>
        <p className="text-white font-bold mb-2">Treino da Semana</p>
        <p className="text-[#444] text-sm">Os protocolos de musculação serão carregados em breve pelo treinador.</p>
      </div>
    </div>
  )
}`,
  'src/app/(student)/corridas/page.tsx': `
'use client'
import { useStudent } from '@/lib/hooks/useStudent'
export default function CorridasPage() {
  const { student } = useStudent()
  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-white text-2xl font-bold mb-1">Corridas</h1>
      <p className="text-[#444] text-sm mb-8">Semana {student?.current_week ?? '—'} · Pelotão {student?.turma ?? '—'}</p>
      <div className="grid gap-4">
        {[['Corrida Leve','Terça-feira','Resistência aeróbica base'],['Tiros','Quinta-feira','Explosão e velocidade'],['Simulado','Sábado','Teste de 12 minutos']].map(([t,d,desc])=>(
          <div key={t} className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{t}</p>
              <p className="text-[#444] text-xs mt-0.5">{d} · {desc}</p>
            </div>
            <span className="text-[#E10600] text-sm">⚡</span>
          </div>
        ))}
      </div>
      <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-8 text-center mt-4">
        <p className="text-[#444] text-sm">Protocolos detalhados serão carregados pelo treinador.</p>
      </div>
    </div>
  )
}`,
  'src/app/(student)/aulas/page.tsx': `
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
}`,
  'src/app/(student)/ranking/page.tsx': `
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
              className={\`flex items-center gap-4 rounded-2xl px-4 py-3.5 border transition-all \${isMe?'bg-[#1a0505] border-[#E10600]/40':'bg-[#0c0c0c] border-[#161616]'}\`}>
              <span className={\`w-8 text-center font-black text-sm \${i===0?'text-[#d4a000]':i===1?'text-[#aaa]':i===2?'text-[#c87400]':'text-[#333]'}\`}>
                {i===0?'🥇':i===1?'🥈':i===2?'🥉':\`#\${i+1}\`}
              </span>
              <div className="flex-1 min-w-0">
                <p className={\`text-sm font-semibold truncate \${isMe?'text-[#E10600]':'text-white'}\`}>
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
}`,
  'src/app/(student)/perfil/page.tsx': `
'use client'
import { useStudent } from '@/lib/hooks/useStudent'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
const RANKS: Record<number,string> = {
  0:'Recruta',1:'Recruta',2:'Recruta Operacional',3:'Soldado Classe III',
  4:'Soldado Classe II',5:'Soldado Classe I',6:'Cabo',7:'Terceiro-Sargento',
  8:'Segundo-Sargento',9:'Primeiro-Sargento',10:'Subtenente',
  11:'Aspirante a Oficial',12:'Tenente TAF Elite',13:'Capitão TAF Elite',
}
export default function PerfilPage() {
  const { student, loading } = useStudent()
  const router = useRouter()
  async function handleLogout() {
    await createClient().auth.signOut()
    router.push('/login')
  }
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-[#E10600] animate-pulse tracking-widest text-sm">CARREGANDO...</p></div>
  if (!student) return null
  const rank = RANKS[student.current_week] ?? 'Recruta'
  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto space-y-5">
      <h1 className="text-white text-2xl font-bold">Perfil</h1>
      <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E10600]/10 border border-[#E10600]/20 flex items-center justify-center text-2xl">◎</div>
          <div>
            <p className="text-white font-bold text-lg">{student.name}</p>
            <p className="text-[#444] text-sm">{rank}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Turma', student.turma],
            ['Semana', \`\${student.current_week} de 12\`],
            ['XP Total', \`\${student.xp} pontos\`],
            ['Sexo', student.sex === 'M' ? 'Masculino' : 'Feminino'],
            ['Concurso', student.concurso || 'Não informado'],
            ['Treino', student.has_gym ? 'Academia' : 'Em Casa'],
          ].map(([label,value])=>(
            <div key={label} className="bg-[#0a0a0a] rounded-xl p-3">
              <p className="text-[#444] text-[10px] tracking-widest uppercase mb-1">{label}</p>
              <p className="text-white text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleLogout}
        className="w-full bg-[#0c0c0c] border border-[#1c1c1c] hover:border-[#333] text-[#555] hover:text-white py-3.5 rounded-xl text-sm font-medium tracking-widest uppercase transition-all">
        Sair da Conta
      </button>
    </div>
  )
}`
}

Object.entries(pages).forEach(([path, content]) => write(path, content))

console.log('\n🎯 TUDO PRONTO! Execute: npm run dev\n')
