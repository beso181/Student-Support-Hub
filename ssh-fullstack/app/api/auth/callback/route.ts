import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile
      await prisma.profile.upsert({
        where: { id: data.user.id },
        update: { email: data.user.email! },
        create: {
          id: data.user.id,
          email: data.user.email!,
          fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          role: 'STUDENT',
        },
      });
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
