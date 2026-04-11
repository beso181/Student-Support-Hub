import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const books = await prisma.book.findMany({
    include: {
      club: true,
      academicYear: true,
      parts: true,
      chapters: { orderBy: { chapterNumber: 'asc' } },
      _count: { select: { papers: true } },
    },
  });
  return NextResponse.json(books);
}
