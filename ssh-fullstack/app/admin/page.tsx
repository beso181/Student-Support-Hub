import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getSession();
  const [paperCount, bookCount, clubCount, chapterCount, userCount, recentPapers, recentActions] = await Promise.all([
    prisma.paper.count(),
    prisma.book.count(),
    prisma.club.count(),
    prisma.chapter.count(),
    prisma.profile.count(),
    prisma.paper.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { club: true } }),
    prisma.adminAction.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { admin: { select: { fullName: true } } } }),
  ]);

  const papersByClub = await prisma.club.findMany({ include: { _count: { select: { papers: true } } } });

  return (
    <div>
      <div className="bg-gradient-to-br from-navy to-navy-light rounded-xl p-6 mb-5 text-white">
        <h2 className="font-serif text-xl font-semibold mb-1">Welcome, {session?.profile.fullName}</h2>
        <p className="text-xs text-white/40">Manage content, monitor activity, and keep the platform running.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-5">
        {[
          { n: paperCount, l: 'Papers', gold: true },
          { n: bookCount, l: 'Books' },
          { n: clubCount, l: 'Clubs' },
          { n: chapterCount, l: 'Chapters' },
          { n: userCount, l: 'Users' },
        ].map(s => (
          <div key={s.l} className="bg-white border border-gray-200 rounded-lg p-3.5">
            <div className={`font-serif text-2xl font-semibold ${s.gold ? 'text-gold-dark' : 'text-navy'}`}>{s.n}</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="section-title">Recent Papers</h3>
          <div className="space-y-1">
            {recentPapers.map(p => (
              <div key={p.id} className="flex gap-2 p-2 bg-white border border-gray-200 rounded text-xs">
                <span className="font-mono text-gray-400">#{p.paperNumber}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-gray-400">{p.authors} · {p.club.slug.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="section-title">Papers by Club</h3>
          {papersByClub.map(c => {
            const pct = paperCount > 0 ? Math.round((c._count.papers / paperCount) * 100) : 0;
            return (
              <div key={c.id} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span>{c.name}</span>
                  <span className="text-gray-400">{c._count.papers} ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {recentActions.length > 0 && (
            <>
              <h3 className="section-title mt-6">Recent Actions</h3>
              {recentActions.map(a => (
                <div key={a.id} className="flex justify-between py-1.5 border-b border-gray-100 text-[11px]">
                  <span>{a.admin.fullName}: {a.action}</span>
                  <span className="text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
