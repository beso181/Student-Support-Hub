import prisma from '@/lib/db';

export default async function AdminAnalyticsPage() {
  const [paperCount, bookCount, clubCount, userCount, recentViews] = await Promise.all([
    prisma.paper.count(),
    prisma.book.count(),
    prisma.club.count(),
    prisma.profile.count(),
    prisma.pageView.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
  ]);

  const papersByClub = await prisma.club.findMany({ include: { _count: { select: { papers: true } } } });
  const papersByYear = await prisma.academicYear.findMany({ include: { _count: { select: { papers: true } } } });
  const topPapers = await prisma.paper.findMany({ orderBy: { viewCount: 'desc' }, take: 10, select: { id: true, title: true, viewCount: true, paperNumber: true } });
  const topCategories = await prisma.paper.groupBy({ by: ['category'], _count: true, orderBy: { _count: { category: 'desc' } }, take: 8 });
  const recentActions = await prisma.adminAction.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { admin: { select: { fullName: true } } } });

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold mb-1">Analytics & Activity</h1>
      <p className="text-xs text-gray-400 mb-5">Platform traffic and content overview</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {[
          { n: recentViews, l: 'Views (7d)' },
          { n: userCount, l: 'Users' },
          { n: paperCount, l: 'Papers', gold: true },
          { n: bookCount, l: 'Books' },
          { n: clubCount, l: 'Clubs' },
        ].map(s => (
          <div key={s.l} className="bg-white border border-gray-200 rounded-lg p-3.5">
            <div className={`font-serif text-2xl font-semibold ${s.gold ? 'text-gold-dark' : 'text-navy'}`}>{s.n}</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Papers by Club */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-3">Papers by Club</h4>
          {papersByClub.map(c => {
            const pct = paperCount > 0 ? Math.round((c._count.papers / paperCount) * 100) : 0;
            return (
              <div key={c.id} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{c.slug.toUpperCase()}</span>
                  <span className="text-gray-400">{c._count.papers} ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Papers by Year */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-3">Papers by Year</h4>
          {papersByYear.map(y => {
            const pct = paperCount > 0 ? Math.round((y._count.papers / paperCount) * 100) : 0;
            return (
              <div key={y.id} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{y.label}</span>
                  <span className="text-gray-400">{y._count.papers}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-navy rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Categories */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-3">Top Categories</h4>
          {topCategories.filter(c => c.category).map(c => (
            <div key={c.category} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-xs">
              <span className="text-gray-600 truncate mr-2">{c.category}</span>
              <span className="font-mono font-medium text-gray-900 flex-shrink-0">{c._count}</span>
            </div>
          ))}
        </div>

        {/* Most Viewed Papers */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-3">Most Viewed Papers</h4>
          {topPapers.map(p => (
            <div key={p.id} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-xs">
              <span className="text-gray-600 truncate mr-2">#{p.paperNumber} {p.title}</span>
              <span className="font-mono text-gold-dark flex-shrink-0">{p.viewCount}</span>
            </div>
          ))}
        </div>

        {/* Recent Admin Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:col-span-2">
          <h4 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-3">Recent Admin Actions</h4>
          {recentActions.length === 0 ? (
            <p className="text-xs text-gray-400">No actions recorded yet.</p>
          ) : (
            recentActions.map(a => (
              <div key={a.id} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-xs">
                <span className="text-gray-600">
                  <strong>{a.admin.fullName}</strong>: {a.action}
                </span>
                <span className="text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
