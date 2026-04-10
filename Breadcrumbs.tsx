import prisma from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PaperPage({ params }: { params: { id: string } }) {
  const paper = await prisma.paper.findUnique({
    where: { id: params.id },
    include: { book: true, club: true, academicYear: true, chapter: true, part: true },
  });
  if (!paper) notFound();

  // Increment view count
  await prisma.paper.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } });

  // Related papers
  const related = await prisma.paper.findMany({
    where: { category: paper.category, id: { not: paper.id } },
    take: 5,
    orderBy: { viewCount: 'desc' },
  });

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Research Centre', href: '/research' },
        { label: paper.book.title.split(':')[0], href: `/research/book/${paper.bookId}` },
        { label: `Paper #${paper.paperNumber}` },
      ]} />

      <div className="grid md:grid-cols-[1fr_220px] gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-gold-dark mb-1">
            Paper #{paper.paperNumber} · {paper.category}
          </p>
          <h1 className="font-serif text-2xl font-semibold leading-tight mb-2">{paper.title}</h1>
          <p className="text-sm text-gray-500 mb-2">{paper.authors}</p>
          <div className="flex gap-3 text-xs text-gray-400 mb-2">
            <span>📅 {paper.year}</span>
            <span>📖 {paper.book.title.split(':')[0]}</span>
            <span>🏛 {paper.club.slug.toUpperCase()}</span>
            <span>👁 {paper.viewCount} views</span>
          </div>
          {paper.keywords.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-4">
              {paper.keywords.map(k => <span key={k} className="tag">{k}</span>)}
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">Abstract</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{paper.abstract}</p>
          </div>

          {paper.pdfUrl && (
            <div>
              <h3 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">Full Text</h3>
              <div className="flex gap-2 mb-3">
                <a href={paper.pdfUrl} target="_blank" rel="noopener" className="btn-gold text-xs">Open PDF ↗</a>
                <a href={paper.pdfUrl} download className="btn-outline text-xs">Download ↓</a>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <iframe src={paper.pdfUrl} className="w-full h-[500px] border-0" title="PDF" />
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-1">If the PDF doesn&apos;t display, use the Open PDF button above.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">Paper Info</h3>
            {[
              ['Number', `#${paper.paperNumber}`],
              ['Category', paper.category || 'N/A'],
              ['Year', String(paper.year)],
              ['Club', paper.club.slug.toUpperCase()],
              ['Views', String(paper.viewCount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-gray-100 text-xs">
                <span className="text-gray-400">{k}</span>
                <span className="font-mono text-[10px]">{v}</span>
              </div>
            ))}
          </div>
          {related.length > 0 && (
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">Related Papers</h3>
              {related.map(r => (
                <Link key={r.id} href={`/research/paper/${r.id}`}
                  className="flex gap-2 py-1.5 border-b border-gray-100 last:border-0 hover:text-gold-dark transition-colors">
                  <span className="font-mono text-[10px] text-gray-400">#{r.paperNumber}</span>
                  <span className="text-xs text-gray-600 line-clamp-1">{r.title}</span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
