'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Turma = 'Alpha' | 'Bravo' | 'Charlie'

interface FormData {
  name: string; sex: 'M' | 'F' | ''; weight: string; height: string
  concurso: string; has_gym: boolean; can_run_12min: boolean | null
  initial_run_12min: string; initial_pullups: string; initial_pushups: string
  initial_situps: string; has_injury: boolean; injury_description: string
  already_approved: boolean
}

function classifyTurma(data: FormData): Turma {
  const dist = parseFloat(data.initial_run_12min) || 0
  const bars = parseInt(data.initial_pullups) || 0
  if (!data.can_run_12min || dist < 1600) return 'Charlie'
  if (dist >= 2200 && bars >= 5) return 'Alpha'
  return 'Bravo'
}

const TURMA_INFO: Record<Turma, { color: string; bg: string; border: string; label: string; desc: string }> = {
  Charlie: { color: 'text-[#aaa]', bg: 'bg-[#1a1a1a]', border: 'border-[#444]', label: 'PELOTAO CHARLIE', desc: 'Base Fisica em Construcao' },
  Bravo:   { color: 'text-[#4a9eff]', bg: 'bg-[#0a1628]', border: 'border-[#1e4a8a]', label: 'PELOTAO BRAVO', desc: 'Em Evolucao' },
  Alpha:   { color: 'text-[#E10600]', bg: 'bg-[#1a0505]', border: 'border-[#E10600]/50', label: 'PELOTAO ALPHA', desc: 'Proximo da Aprovacao' },
}

export default function AnamnesePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [turma, setTurma] = useState<Turma | null>(null)
  const [form, setForm] = useState<FormData>({
    name: '', sex: '', weight: '', height: '', concurso: '', has_gym: true,
    can_run_12min: null, initial_run_12min: '', initial_pullups: '',
    initial_pushups: '', initial_situps: '', has_injury: false,
    injury_description: '', already_approved: false,
  })

  function set(field: keyof FormData, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function nextStep() {
    if (step === 3) { setTurma(classifyTurma(form)); setStep(4) }
    else setStep(s => s + 1)
  }

  async function handleFinish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const t = turma || classifyTurma(form)
    await supabase.from('students').insert({
      user_id: user.id, name: form.name, sex: form.sex || 'M',
      weight: parseFloat(form.weight) || null, height: parseFloat(form.height) || null,
      turma: t, concurso: form.concurso || null, has_gym: form.has_gym,
      can_run_12min: form.can_run_12min,
      initial_run_12min: parseFloat(form.initial_run_12min) || null,
      initial_pullups: parseInt(form.initial_pullups) || 0,
      initial_pushups: parseInt(form.initial_pushups) || 0,
      initial_situps: parseInt(form.initial_situps) || 0,
      has_injury: form.has_injury, injury_description: form.injury_description || null,
      already_approved: form.already_approved, anamnese_done: true,
      current_week: 0, xp: 0, status: 'active',
    })
    const { data: student } = await supabase.from('students').select('id').eq('user_id', user.id).single()
    if (student) { await supabase.from('week_unlocks').insert({ student_id: student.id, week: 0 }) }
    router.push('/dashboard')
  }

  const inputCls = "w-full bg-[#141414] border border-[#222] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E10600] transition placeholder-[#3a3a3a]"
  const labelCls = "block text-[#666] text-[11px] tracking-widest uppercase mb-1.5"
  const btnSel = (a: boolean) => `py-3 rounded-xl border text-sm font-medium transition-all ${a ? 'bg-[#E10600] border-[#E10600] text-white' : 'bg-[#141414] border-[#222] text-[#666] hover:border-[#444]'}`

  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center px-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at top, #1a0505 0%, #070707 70%)' }}>
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <span className="bg-[#E10600] text-white font-black text-xl px-3 py-1 tracking-widest">TAF</span>
            <span className="text-white font-black text-xl tracking-[.2em]">ELITE</span>
          </div>
        </div>

        {step < 4 && (
          <div className="mb-6">
            <div className="flex justify-between text-[#555] text-xs tracking-widest mb-2">
              <span>ETAPA {step} DE 3</span>
              <span>{['DADOS PESSOAIS','CAPACIDADE ATUAL','INFORMACOES FINAIS'][step-1]}</span>
            </div>
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#E10600] rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-8"
          style={{ boxShadow: '0 0 50px rgba(225,6,0,.06)' }}>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg mb-4">Dados Pessoais</h2>
              <div><label className={labelCls}>Nome completo</label>
                <input type="text" placeholder="Seu nome" value={form.name}
                  onChange={e => set('name', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Sexo</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['M','F'] as const).map(v => (
                    <button key={v} type="button" onClick={() => set('sex', v)} className={btnSel(form.sex === v)}>
                      {v === 'M' ? 'Masculino' : 'Feminino'}
                    </button>
                  ))}
                </div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Peso (kg)</label>
                  <input type="number" placeholder="80" value={form.weight} onChange={e => set('weight', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Altura (cm)</label>
                  <input type="number" placeholder="175" value={form.height} onChange={e => set('height', e.target.value)} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Concurso pretendido</label>
                <input type="text" placeholder="Ex: PMDF, PRF, PCDF..." value={form.concurso}
                  onChange={e => set('concurso', e.target.value)} className={inputCls} /></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg mb-4">Capacidade Atual</h2>
              <div><label className={labelCls}>Consegue correr 12 minutos sem parar?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} type="button" onClick={() => set('can_run_12min', v)} className={btnSel(form.can_run_12min === v)}>
                      {v ? 'Sim' : 'Nao'}
                    </button>
                  ))}
                </div></div>
              {form.can_run_12min && (
                <div><label className={labelCls}>Distancia nos 12 minutos (metros)</label>
                  <input type="number" placeholder="Ex: 2000" value={form.initial_run_12min}
                    onChange={e => set('initial_run_12min', e.target.value)} className={inputCls} /></div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {(['initial_pullups','initial_pushups','initial_situps'] as const).map((field, i) => (
                  <div key={field}>
                    <label className={labelCls}>{['Barras','Flexoes','Abdominais'][i]}</label>
                    <input type="number" placeholder="0" value={form[field] as string}
                      onChange={e => set(field, e.target.value)} className={inputCls} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg mb-4">Informacoes Finais</h2>
              <div><label className={labelCls}>Onde vai treinar musculacao?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} type="button" onClick={() => set('has_gym', v)} className={btnSel(form.has_gym === v)}>
                      {v ? 'Academia' : 'Em Casa'}
                    </button>
                  ))}
                </div></div>
              <div><label className={labelCls}>Possui alguma lesao?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} type="button" onClick={() => set('has_injury', v)} className={btnSel(form.has_injury === v)}>
                      {v ? 'Sim' : 'Nao'}
                    </button>
                  ))}
                </div></div>
              {form.has_injury && (
                <div><label className={labelCls}>Descreva a lesao</label>
                  <input type="text" placeholder="Ex: tendinite no joelho" value={form.injury_description}
                    onChange={e => set('injury_description', e.target.value)} className={inputCls} /></div>
              )}
              <div><label className={labelCls}>Ja esta aprovado em algum concurso?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} type="button" onClick={() => set('already_approved', v)} className={btnSel(form.already_approved === v)}>
                      {v ? 'Sim' : 'Nao'}
                    </button>
                  ))}
                </div></div>
            </div>
          )}

          {step === 4 && turma && (
            <div className="text-center">
              <p className="text-[#555] text-xs tracking-[.3em] uppercase mb-4">Diagnostico Operacional</p>
              <div className={`${TURMA_INFO[turma].bg} border ${TURMA_INFO[turma].border} rounded-2xl p-6 mb-6`}>
                <div className="text-4xl mb-3">{turma === 'Alpha' ? '🔴' : turma === 'Bravo' ? '🔵' : '⚪'}</div>
                <h2 className={`font-black text-2xl tracking-widest mb-1 ${TURMA_INFO[turma].color}`}>
                  {TURMA_INFO[turma].label}
                </h2>
                <p className="text-[#666] text-sm">{TURMA_INFO[turma].desc}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6 text-left">
                {[
                  ['Corrida', form.can_run_12min ? `${form.initial_run_12min || '?'}m` : 'Nao corre 12min'],
                  ['Barras', `${form.initial_pullups || 0} rep`],
                  ['Abdominais', `${form.initial_situps || 0} rep`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#141414] border border-[#222] rounded-xl p-3">
                    <p className="text-[#555] text-[10px] tracking-widest uppercase mb-1">{label}</p>
                    <p className="text-white text-sm font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[#555] text-xs mb-6 leading-relaxed">
                Com base nos seus resultados, voce foi alocado ao{' '}
                <span className={TURMA_INFO[turma].color + ' font-semibold'}>{TURMA_INFO[turma].label}</span>.
                O protocolo sera adaptado para o seu nivel atual.
              </p>
              <button onClick={handleFinish} disabled={loading}
                className="w-full bg-[#E10600] hover:bg-[#c20000] disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm tracking-widest uppercase transition-colors">
                {loading ? 'PREPARANDO MISSAO...' : 'INICIAR OPERACAO'}
              </button>
            </div>
          )}

          {step < 4 && (
            <button onClick={nextStep}
              disabled={step === 1 && (!form.name || !form.sex)}
              className="w-full mt-6 bg-[#E10600] hover:bg-[#c20000] disabled:opacity-40 text-white font-bold py-3.5 rounded-xl text-sm tracking-widest uppercase transition-colors">
              {step === 3 ? 'VER MEU DIAGNOSTICO' : 'PROXIMA ETAPA'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
