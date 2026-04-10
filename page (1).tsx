import { createClient } from './supabase/server';
import prisma from './db';

export async function getSession() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  return profile ? { user, profile } : null;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');
  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.profile.role)) {
    throw new Error('Not authorized');
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');
  if (session.profile.role !== 'SUPER_ADMIN') throw new Error('Not authorized');
  return session;
}

export const ALLOWED_EMAIL_DOMAINS = ['amg.sch.ae'];

export function isAllowedEmail(email: string): boolean {
  return ALLOWED_EMAIL_DOMAINS.some(d => email.endsWith(`@${d}`));
}
