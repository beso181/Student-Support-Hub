import prisma from '@/lib/db';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 60;

export default async function DashboardPage() {
  const [papers, books, clubs, categories] = await Promise.all([
    prisma.paper.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { book: true } }),
    prisma.book.findMany({ include: { _count: { select: { papers: true } } } }),
    prisma.club.findMany({ include: { _count: { select: { papers: true } } } }),
    prisma.paper.groupBy({ by: ['category'], _count: true, orderBy: { _count: { category: 'desc' } }, take: 8 }),
  ]);
  const totalPapers = await prisma.paper.count();
  const totalCategories = await prisma.paper.groupBy({ by: ['category'], _count: true });

  return (
    <div className="grid md:grid-cols-[200px_1fr_240px] min-h-screen">
      <aside className="bg-white border-r border-gray-200 py-3 sticky top-14 h-[calc(100vh-56px)] hidden md:block">
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 py-2">Dashboard</p>
        <span className="sidebar-btn-active">🏠 Overview</span>
        <Link href="/research/papers" className="sidebar-btn">📄 Papers</Link>
        <Link href="/research" className="sidebar-btn">📚 Publications</Link>
        <Link href="/resources" className="sidebar-btn">📖 Resources</Link>
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 pt-4 pb-2">Quick Access</p>
        {books.map(b => (
          <Link key={b.id} href={`/research/book/${b.id}`} className="sidebar-btn text-[11px]">
            {b.title.split(':')[0]}
          </Link>
        ))}
      </aside>

      <div className="p-5">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />
        <h1 className="font-serif text-xl font-semibold mb-1">Student Dashboard</h1>
        <p className="text-xs text-gray-400 mb-5">Your personalized research dashboard.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {[
            { n: totalPapers, l: 'Papers', gold: true },
            { n: books.length, l: 'Publications' },
            { n: clubs.length, l: 'Clubs' },
            { n: totalCategories.length, l: 'Categories' },
          ].map(s => (
            <div key={s.l} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className={`font-serif text-xl font-semibold ${s.gold ? 'text-gold-dark' : 'text-navy'}`}>{s.n}</div>
              <div className="text-[9px] text-gray-400 uppercase">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div>
            <h2 className="section-title">Recently Added</h2>
            {papers.map(p => (
              <Link key={p.id} href={`/research/paper/${p.id}`}
                className="flex gap-2 p-2 bg-white border border-gray-200 rounded mb-1 hover:border-gold transition-all">
                <span className="font-mono text-[10px] text-gray-400 min-w-[24px]">#{p.paperNumber}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.title}</p>
                  <p className="text-[10px] text-gray-400">{p.authors}</p>
                </div>
              </Link>
            ))}
          </div>
          <div>
            <h2 className="section-title">Explore by Category</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.filter(c => c.category).map(c => (
                <Link key={c.category} href={`/research/papers?category=${c.category}`}
                  className="card p-2.5">
                  <p className="text-[11px] font-medium line-clamp-1">{c.category}</p>
                  <p className="text-[9px] text-gray-400 font-mono">{c._count} papers</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <aside className="bg-white border-l border-gray-200 p-3.5 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto hidden md:block space-y-4">
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">Quick Actions</h3>
          {[
            { emoji: '📄', label: 'Browse All Papers', href: '/research/papers' },
            { emoji: '📚', label: 'View Publications', href: '/research' },
            { emoji: '📖', label: 'Study Resources', href: '/resources' },
            { emoji: '🤝', label: 'Find a Mentor', href: '/community' },
          ].map(l => (
            <Link key={l.label} href={l.href} className="flex gap-2 py-1.5 text-xs text-gray-500 hover:text-gold-dark border-b border-gray-100 last:border-0">
              <span>{l.emoji}</span> {l.label}
            </Link>
          ))}
        </div>
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">Platform Stats</h3>
          {[['Papers', totalPapers], ['Books', books.length], ['Clubs', clubs.length], ['Categories', totalCategories.length]].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between py-1 border-b border-gray-100 text-xs">
              <span className="text-gray-400">{k}</span>
              <span className="font-mono font-medium">{v}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
