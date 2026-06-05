
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
}