'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return setError('As senhas nao coincidem.')
    if (password.length < 6) return setError('Minimo 6 caracteres.')
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    router.push('/anamnese')
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-[#070707]'
      style={{ backgroundImage: 'radial-gradient(ellipse at top, #1a0505 0%, #070707 70%)' }}>
      <div className='relative w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center gap-2'>
            <span className='bg-[#E10600] text-white font-black text-2xl px-3 py-1 tracking-widest'>TAF</span>
            <span className='text-white font-black text-2xl tracking-[.2em]'>ELITE</span>
          </div>
          <p className='text-[#555] text-xs tracking-[.3em] uppercase mt-2'>Sua missao comeca aqui</p>
        </div>
        <div className='bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-8'
          style={{ boxShadow: '0 0 50px rgba(225,6,0,.07)' }}>
          <h1 className='text-white font-bold text-xl mb-1'>Criar Conta</h1>
          <p className='text-[#555] text-sm mb-6'>Crie suas credenciais de acesso.</p>
          <form onSubmit={handleRegister} className='space-y-4'>
            <div>
              <label className='block text-[#777] text-[11px] tracking-widest uppercase mb-1.5'>E-mail</label>
              <input type='email' value={email} onChange={e => setEmail(e.target.value)} required placeholder='seu@email.com'
                className='w-full bg-[#171717] border border-[#252525] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E10600] transition' />
            </div>
            <div>
              <label className='block text-[#777] text-[11px] tracking-widest uppercase mb-1.5'>Senha</label>
              <input type='password' value={password} onChange={e => setPass(e.target.value)} required placeholder='Minimo 6 caracteres'
                className='w-full bg-[#171717] border border-[#252525] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E10600] transition' />
            </div>
            <div>
              <label className='block text-[#777] text-[11px] tracking-widest uppercase mb-1.5'>Confirmar Senha</label>
              <input type='password' value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder='Repita a senha'
                className='w-full bg-[#171717] border border-[#252525] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E10600] transition' />
            </div>
            {error && <div className='bg-[#1a0505] border border-[#E10600]/25 text-[#ff7070] text-sm rounded-xl px-4 py-3'>{error}</div>}
            <button type='submit' disabled={loading}
              className='w-full bg-[#E10600] hover:bg-[#c20000] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm tracking-widest uppercase transition-colors mt-2'>
              {loading ? 'CRIANDO...' : 'ENTRAR PARA A OPERACAO'}
            </button>
          </form>
          <div className='mt-6 pt-6 border-t border-[#181818] text-center'>
            <p className='text-[#484848] text-sm'>Ja tem conta?{' '}
              <Link href='/login' className='text-[#E10600] hover:text-[#ff3333] transition-colors font-semibold'>Fazer login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
