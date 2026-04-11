import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (q.length < 2) return NextResponse.json([]);

  const papers = await prisma.paper.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { authors: { contains: q, mode: 'insensitive' } },
        { abstract: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: { book: true, club: true },
    orderBy: { paperNumber: 'asc' },
    take: 50,
  });

  return NextResponse.json(papers);
}
