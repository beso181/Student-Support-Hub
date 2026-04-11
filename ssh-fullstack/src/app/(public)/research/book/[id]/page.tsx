import prisma from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      club: true,
      academicYear: true,
      parts: { orderBy: { partNumber: 'asc' } },
      chapters: { orderBy: { chapterNumber: 'asc' } },
      papers: { orderBy: { paperNumber: 'asc' }, include: { chapter: true } },
    },
  });
  if (!book) notFound();

  const otherBooks = await prisma.book.findMany({ where: { id: { not: book.id } }, take: 4 });

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Research Centre', href: '/research' },
        { label: book.title.split(':')[0] },
      ]} />

      <div className="grid md:grid-cols-[1fr_220px] gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-gold-dark mb-1">
            {book.club.name} · {book.academicYear.label}
          </p>
          <h1 className="font-serif text-2xl font-semibold leading-tight mb-2">{book.title}</h1>
          <p className="text-sm text-gray-500 mb-2">Edited by {book.editors}</p>
          <div className="flex gap-3 text-xs text-gray-400 mb-4">
            <span>📅 {book.publicationYear}</span>
            <span>📄 {book.papers.length} Papers</span>
            <span>📚 {book.parts.length} Parts</span>
            <span>📂 {book.chapters.length} Chapters</span>
          </div>

          <div className="mb-6">
            <h3 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">About This Publication</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{book.description}</p>
          </div>

          {book.parts.map(pt => {
            const ptChapters = book.chapters.filter(c => c.partId === pt.id);
            return (
              <div key={pt.id} className="mb-6">
                <h3 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-3 pb-1 border-b border-gray-200">{pt.title}</h3>
                {ptChapters.map(ch => {
                  const chPapers = book.papers.filter(p => p.chapterId === ch.id || p.category === ch.title);
                  if (!chPapers.length) return null;
                  return (
                    <div key={ch.id} className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium">Chapter {ch.chapterNumber}: {ch.title}</span>
                        <span className="text-gray-400 font-mono text-[10px]">{chPapers.length} papers</span>
                      </div>
                      <div className="space-y-0.5">
                        {chPapers.map((p, i) => (
                          <Link key={p.id} href={`/research/paper/${p.id}`}
                            className="flex items-center gap-2.5 p-2 bg-white border border-gray-200 rounded hover:border-gold hover:bg-gold-lighter transition-all">
                            <span className="font-mono text-[10px] text-gray-400 min-w-[20px]">{String(i + 1).padStart(2, '0')}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium truncate">{p.title}</h4>
                              <p className="text-[10px] text-gray-400">{p.authors}</p>
                            </div>
                            <span className="text-gray-300 text-xs">›</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">Publication Info</h3>
            {[
              ['Club', book.club.slug.toUpperCase()],
              ['Year', book.academicYear.label],
              ['Papers', String(book.papers.length)],
              ['Chapters', String(book.chapters.length)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-gray-100 text-xs">
                <span className="text-gray-400">{k}</span>
                <span className="font-mono font-medium">{v}</span>
              </div>
            ))}
          </div>
          {otherBooks.length > 0 && (
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-gray-200">Other Publications</h3>
              {otherBooks.map(b => (
                <Link key={b.id} href={`/research/book/${b.id}`}
                  className="block py-1.5 text-xs text-gray-500 hover:text-gold-dark border-b border-gray-100 last:border-0">
                  {b.title.split(':')[0]}
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
