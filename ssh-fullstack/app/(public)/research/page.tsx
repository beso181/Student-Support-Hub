import Link from 'next/link';
import prisma from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 60;

export default async function ResearchPage() {
  const [books, clubs, years, categories] = await Promise.all([
    prisma.book.findMany({ include: { club: true, academicYear: true, _count: { select: { papers: true } } } }),
    prisma.club.findMany({ include: { _count: { select: { papers: true } } } }),
    prisma.academicYear.findMany(),
    prisma.paper.groupBy({ by: ['category'], _count: true, orderBy: { _count: { category: 'desc' } } }),
  ]);
  const totalPapers = await prisma.paper.count();

  return (
    <div className="grid md:grid-cols-[200px_1fr] min-h-screen">
      {/* Sidebar */}
      <aside className="bg-white border-r border-gray-200 py-3 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto hidden md:block">
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 py-2">Research Centre</p>
        <Link href="/research" className="sidebar-btn-active">📚 Publications</Link>
        <Link href="/research/papers" className="sidebar-btn">📄 All Papers <span className="float-right font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">{totalPapers}</span></Link>
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 pt-4 pb-2">By Club</p>
        {clubs.map(c => (
          <Link key={c.id} href={`/research/papers?club=${c.id}`} className="sidebar-btn">
            {c.slug.toUpperCase()} <span className="float-right font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">{c._count.papers}</span>
          </Link>
        ))}
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 pt-4 pb-2">Publications</p>
        {books.map(b => (
          <Link key={b.id} href={`/research/book/${b.id}`} className="sidebar-btn text-[11px]">
            {b.title.split(':')[0]}
          </Link>
        ))}
      </aside>

      {/* Main */}
      <div className="p-5">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Research Centre' }]} />
        <div className="mb-6">
          <h1 className="font-serif text-xl font-semibold mb-1">Research Centre</h1>
          <p className="text-xs text-gray-400">{totalPapers} papers · {books.length} publications · {clubs.length} clubs</p>
        </div>

        {/* Publications */}
        <section className="mb-8">
          <h2 className="section-title">Publications</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {books.map(b => (
              <Link key={b.id} href={`/research/book/${b.id}`}
                className="grid grid-cols-[140px_1fr] card">
                <div className="bg-navy flex items-center justify-center p-4 text-center">
                  <div>
                    <p className="font-mono text-[7px] uppercase tracking-wider text-white/40 mb-1">{b.club.slug.toUpperCase()} · {b.academicYear.label}</p>
                    <h3 className="font-serif text-xs font-semibold text-gold leading-tight">{b.title}</h3>
                    <p className="text-[9px] text-white/30 mt-1">{b._count.papers} papers</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-gray-400 line-clamp-3 mb-2">{b.description?.slice(0, 120)}...</p>
                  <div className="flex gap-1.5"><span className="tag">{b.academicYear.label}</span><span className="tag">{b._count.papers} papers</span></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="section-title">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.filter(c => c.category).map(c => (
              <Link key={c.category} href={`/research/papers?category=${c.category}`}
                className="card p-3">
                <p className="text-[11px] font-medium text-gray-700 line-clamp-1">{c.category}</p>
                <p className="text-[10px] text-gray-400 font-mono">{c._count} papers</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
