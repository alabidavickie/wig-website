import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if next is a relative path or absolute URL
      const isAbsoluteNext = next.startsWith('http')
      const redirectUrl = isAbsoluteNext ? next : `${origin}${next.startsWith('/') ? next : `/${next}`}`
      
      // Default to dashboard if no valid next is provided
      if (next === '/') {
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      return NextResponse.redirect(redirectUrl)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
