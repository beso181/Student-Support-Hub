import Link from 'next/link';
import prisma from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const revalidate = 60; // ISR: revalidate every 60s

export default async function HomePage() {
  const [papers, books, clubs, years] = await Promise.all([
    prisma.paper.findMany({
      orderBy: { paperNumber: 'desc' },
      take: 8,
      include: { book: true, club: true },
    }),
    prisma.book.findMany({
      include: { club: true, academicYear: true, _count: { select: { papers: true } } },
    }),
    prisma.club.findMany({ include: { _count: { select: { papers: true } } } }),
    prisma.academicYear.findMany(),
  ]);

  const totalPapers = await prisma.paper.count();

  return (
    <>
      <Navbar />
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-[#1b426e] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_320px] gap-10 items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[3px] text-gold mb-3 flex items-center gap-2">
              <span className="w-5 h-px bg-gold" /> Al Mawakeb Research Center
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.1] mb-4">
              Student Support Hub
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-lg mb-6">
              An academic platform empowering students through peer-reviewed research, mentorship programs, and innovation — bridging school to university.
            </p>
            <div className="flex gap-3">
              <Link href="/research" className="btn-gold">Explore Research Centre</Link>
              <Link href="/dashboard" className="px-5 py-2.5 text-sm text-white border border-white/15 rounded-md hover:bg-white/5 transition">
                Student Dashboard
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { n: totalPapers, l: 'Research Papers' },
              { n: books.length, l: 'Publications' },
              { n: clubs.length, l: 'Research Clubs' },
              { n: years.length, l: 'Academic Years' },
            ].map(s => (
              <div key={s.l} className="bg-white/[.03] border border-white/[.06] rounded-lg p-4 text-center">
                <div className="font-serif text-2xl font-semibold text-gold">{s.n}</div>
                <div className="text-[10px] text-white/35 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Publications */}
        <section className="mb-10">
          <div className="flex justify-between items-baseline mb-4 pb-2 border-b border-gray-200">
            <h2 className="font-serif text-lg font-semibold">Featured Publications</h2>
            <Link href="/research" className="text-xs text-gold-dark hover:underline">View all →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {books.map(b => (
              <Link key={b.id} href={`/research/book/${b.id}`}
                className="grid grid-cols-[160px_1fr] bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gold hover:shadow-md transition-all">
                <div className="bg-navy flex items-center justify-center p-5 text-center">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-white/40 mb-1">{b.club.slug.toUpperCase()}</p>
                    <h3 className="font-serif text-sm font-semibold text-gold leading-tight">{b.title}</h3>
                    <p className="text-[10px] text-white/30 mt-1">{b._count.papers} papers</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 line-clamp-3 mb-2">{b.description}</p>
                  <p className="text-[10px] text-gray-400">✏️ {b.editors?.split(',')[0]}</p>
                  <div className="flex gap-1.5 mt-2">
                    <span className="tag">{b.academicYear.label}</span>
                    <span className="tag">{b._count.papers} papers</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Papers + Sidebar */}
        <div className="grid md:grid-cols-[1fr_280px] gap-6">
          <section>
            <div className="flex justify-between items-baseline mb-3 pb-2 border-b border-gray-200">
              <h2 className="font-serif text-lg font-semibold">Latest Research Papers</h2>
              <Link href="/research/papers" className="text-xs text-gold-dark hover:underline">Browse all →</Link>
            </div>
            <div className="space-y-1">
              {papers.map(p => (
                <Link key={p.id} href={`/research/paper/${p.id}`}
                  className="flex gap-3 p-2.5 bg-white border border-gray-200 rounded-md hover:border-gold hover:bg-gold-lighter transition-all">
                  <span className="font-mono text-[11px] text-gray-400 min-w-[28px] pt-0.5">#{p.paperNumber}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12.5px] font-medium text-gray-900 truncate">{p.title}</h4>
                    <p className="text-[10.5px] text-gray-400 truncate">{p.authors} · {p.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2 pb-1.5 border-b border-gray-200">
                Research Clubs
              </h3>
              {clubs.map(c => (
                <Link key={c.id} href={`/research/papers?club=${c.id}`}
                  className="flex justify-between items-center py-1.5 text-xs hover:text-gold-dark transition-colors border-b border-gray-100 last:border-0">
                  <span><strong>{c.slug.toUpperCase()}</strong> — {c.name}</span>
                  <span className="text-gray-400 font-mono text-[10px]">{c._count.papers}</span>
                </Link>
              ))}
            </div>
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-2 pb-1.5 border-b border-gray-200">
                Quick Links
              </h3>
              {[
                { emoji: '📖', label: 'Academic Resources', href: '/resources' },
                { emoji: '🤝', label: 'Mentorship Program', href: '/community' },
                { emoji: '🎓', label: 'Alumni Network', href: '/community' },
              ].map(l => (
                <Link key={l.label} href={l.href}
                  className="flex gap-2 py-1.5 text-xs text-gray-500 hover:text-gold-dark transition-colors border-b border-gray-100 last:border-0">
                  <span>{l.emoji}</span> {l.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
