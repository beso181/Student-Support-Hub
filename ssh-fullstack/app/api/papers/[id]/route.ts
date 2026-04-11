import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const paper = await prisma.paper.findUnique({
    where: { id: params.id },
    include: { book: true, club: true, academicYear: true, chapter: true, part: true },
  });
  if (!paper) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Increment view count
  await prisma.paper.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } });

  return NextResponse.json(paper);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await request.json();
    const paper = await prisma.paper.update({ where: { id: params.id }, data: body });
    return NextResponse.json(paper);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.paper.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
