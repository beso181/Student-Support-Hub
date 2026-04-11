import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const clubs = await prisma.club.findMany({
    include: { _count: { select: { papers: true, books: true } } },
  });
  return NextResponse.json(clubs);
}
