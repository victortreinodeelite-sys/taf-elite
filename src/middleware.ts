import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { cookies: { getAll() { return request.cookies.getAll() }, setAll(s: any) { s.forEach(({name,value}: any) => request.cookies.set(name,value)); supabaseResponse = NextResponse.next({ request }); s.forEach(({name,value,options}: any) => supabaseResponse.cookies.set(name,value,options)) } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const pub = ['/login','/cadastro']
  const isPublic = pub.some(r => pathname.startsWith(r))
  if (user && isPublic) return NextResponse.redirect(new URL('/dashboard', request.url))
  return supabaseResponse
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
