import prisma from '@/lib/db';
import Link from 'next/link';

export default async function AdminPapersPage({ searchParams }: { searchParams: { q?: string } }) {
  const where: any = {};
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { authors: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }

  const papers = await prisma.paper.findMany({
    where,
    include: { book: true, club: true },
    orderBy: { paperNumber: 'asc' },
    take: 100,
  });
  const totalCount = await prisma.paper.count();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-serif text-xl font-semibold">Papers ({totalCount})</h1>
          <p className="text-xs text-gray-400">Manage all research papers</p>
        </div>
        <Link href="/admin/upload" className="btn-gold text-xs">+ Upload New</Link>
      </div>

      <form className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input name="q" defaultValue={searchParams.q} placeholder="Search papers..."
            className="w-full max-w-md pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:border-gold outline-none" />
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-3 font-mono text-[9px] uppercase tracking-wider text-gray-400">#</th>
              <th className="text-left p-3 font-mono text-[9px] uppercase tracking-wider text-gray-400">Title</th>
              <th className="text-left p-3 font-mono text-[9px] uppercase tracking-wider text-gray-400">Authors</th>
              <th className="text-left p-3 font-mono text-[9px] uppercase tracking-wider text-gray-400">Book</th>
              <th className="text-left p-3 font-mono text-[9px] uppercase tracking-wider text-gray-400">Club</th>
              <th className="text-left p-3 font-mono text-[9px] uppercase tracking-wider text-gray-400">Views</th>
              <th className="text-left p-3 font-mono text-[9px] uppercase tracking-wider text-gray-400">PDF</th>
            </tr>
          </thead>
          <tbody>
            {papers.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gold-lighter transition-colors">
                <td className="p-3 font-mono text-gray-400">{p.paperNumber}</td>
                <td className="p-3 font-medium max-w-[200px] truncate">{p.title}</td>
                <td className="p-3 text-gray-500 max-w-[120px] truncate">{p.authors}</td>
                <td className="p-3 text-gray-400">{p.book.title.split(':')[0]}</td>
                <td className="p-3"><span className="tag">{p.club.slug.toUpperCase()}</span></td>
                <td className="p-3 text-gray-400 font-mono">{p.viewCount}</td>
                <td className="p-3">{p.pdfUrl ? <span className="text-green-600">✓</span> : <span className="text-red-400">✗</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {papers.length >= 100 && (
          <div className="p-3 text-center text-xs text-gray-400">Showing first 100. Use search to find specific papers.</div>
        )}
      </div>
    </div>
  );
}
