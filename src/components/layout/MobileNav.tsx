
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
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${active ? 'text-[#E10600]' : 'text-[#3a3a3a]'}`}>
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[9px] tracking-wide">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
