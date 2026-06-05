
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
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-[#E10600] text-white shadow-lg' : 'text-[#444] hover:text-white hover:bg-[#111]'
              }`}>
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
