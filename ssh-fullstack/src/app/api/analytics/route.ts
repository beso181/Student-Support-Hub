import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const [paperCount, bookCount, clubCount, chapterCount, userCount, recentViews, topPapers, recentActions] =
      await Promise.all([
        prisma.paper.count(),
        prisma.book.count(),
        prisma.club.count(),
        prisma.chapter.count(),
        prisma.profile.count(),
        prisma.pageView.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
        prisma.paper.findMany({ orderBy: { viewCount: 'desc' }, take: 10, select: { id: true, title: true, viewCount: true } }),
        prisma.adminAction.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { admin: { select: { fullName: true } } } }),
      ]);

    const papersByClub = await prisma.paper.groupBy({ by: ['clubId'], _count: true });
    const papersByYear = await prisma.paper.groupBy({ by: ['academicYearId'], _count: true });

    return NextResponse.json({
      stats: { paperCount, bookCount, clubCount, chapterCount, userCount, recentViews },
      topPapers,
      recentActions,
      papersByClub,
      papersByYear,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
