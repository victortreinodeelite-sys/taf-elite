
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
}