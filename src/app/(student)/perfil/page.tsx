
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
            ['Semana', `${student.current_week} de 12`],
            ['XP Total', `${student.xp} pontos`],
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
}