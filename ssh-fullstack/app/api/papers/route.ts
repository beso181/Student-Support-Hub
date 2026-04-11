import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const club = searchParams.get('club');
  const year = searchParams.get('year');
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '200');

  const where: any = {};
  if (club) where.clubId = club;
  if (year) where.academicYearId = year;
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { authors: { contains: q, mode: 'insensitive' } },
      { abstract: { contains: q, mode: 'insensitive' } },
    ];
  }

  const papers = await prisma.paper.findMany({
    where,
    include: { book: true, club: true, academicYear: true, chapter: true },
    orderBy: { paperNumber: 'asc' },
    take: limit,
  });

  return NextResponse.json(papers);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const paper = await prisma.paper.create({ data: body, include: { book: true, club: true } });
    return NextResponse.json(paper, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message.includes('auth') ? 401 : 500 });
  }
}
