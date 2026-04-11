import prisma from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import PaperCard from '@/components/PaperCard';
import Link from 'next/link';

export const revalidate = 60;

export default async function PapersPage({ searchParams }: { searchParams: { club?: string; year?: string; category?: string; q?: string } }) {
  const where: any = {};
  if (searchParams.club) where.clubId = searchParams.club;
  if (searchParams.year) where.academicYearId = searchParams.year;
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { authors: { contains: searchParams.q, mode: 'insensitive' } },
      { abstract: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }

  const [papers, clubs, years, allCategories, totalCount] = await Promise.all([
    prisma.paper.findMany({ where, include: { book: true, club: true, academicYear: true, chapter: true }, orderBy: { paperNumber: 'asc' } }),
    prisma.club.findMany({ include: { _count: { select: { papers: true } } } }),
    prisma.academicYear.findMany(),
    prisma.paper.groupBy({ by: ['category'], _count: true, orderBy: { _count: { category: 'desc' } } }),
    prisma.paper.count(),
  ]);

  return (
    <div className="grid md:grid-cols-[200px_1fr] min-h-screen">
      <aside className="bg-white border-r border-gray-200 py-3 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto hidden md:block">
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 py-2">Research Centre</p>
        <Link href="/research" className="sidebar-btn">📚 Publications</Link>
        <Link href="/research/papers" className="sidebar-btn-active">📄 All Papers <span className="float-right font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">{totalCount}</span></Link>
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 pt-4 pb-2">By Club</p>
        {clubs.map(c => (
          <Link key={c.id} href={`/research/papers?club=${c.id}`}
            className={searchParams.club === c.id ? 'sidebar-btn-active' : 'sidebar-btn'}>
            {c.slug.toUpperCase()} <span className="float-right font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">{c._count.papers}</span>
          </Link>
        ))}
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 pt-4 pb-2">By Year</p>
        {years.map(y => (
          <Link key={y.id} href={`/research/papers?year=${y.id}`}
            className={searchParams.year === y.id ? 'sidebar-btn-active' : 'sidebar-btn'}>
            {y.label}
          </Link>
        ))}
      </aside>

      <div className="p-5">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Research Centre', href: '/research' }, { label: 'All Papers' }]} />

        {/* Search + Filters */}
        <form className="mb-4">
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input name="q" defaultValue={searchParams.q} placeholder="Search papers, authors, keywords..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:border-gold focus:ring-2 focus:ring-gold/10 outline-none" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select name="club" defaultValue={searchParams.club}
              className="text-xs border border-gray-300 rounded-full px-3 py-1.5 bg-white focus:border-gold outline-none">
              <option value="">All Clubs</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="year" defaultValue={searchParams.year}
              className="text-xs border border-gray-300 rounded-full px-3 py-1.5 bg-white focus:border-gold outline-none">
              <option value="">All Years</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.label}</option>)}
            </select>
            <select name="category" defaultValue={searchParams.category}
              className="text-xs border border-gray-300 rounded-full px-3 py-1.5 bg-white focus:border-gold outline-none">
              <option value="">All Categories</option>
              {allCategories.filter(c => c.category).map(c => <option key={c.category} value={c.category!}>{c.category}</option>)}
            </select>
            <button type="submit" className="btn-gold text-xs">Filter</button>
            {(searchParams.club || searchParams.year || searchParams.category || searchParams.q) && (
              <Link href="/research/papers" className="text-xs text-red-500 hover:underline">✕ Clear</Link>
            )}
            <span className="ml-auto text-xs text-gray-400 font-mono">{papers.length} results</span>
          </div>
        </form>

        {papers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <h3 className="font-serif text-lg mb-1">No papers found</h3>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {papers.map(p => <PaperCard key={p.id} paper={p as any} />)}
          </div>
        )}
      </div>
    </div>
  );
}
