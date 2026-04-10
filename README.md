import Breadcrumbs from '@/components/Breadcrumbs';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
  const papers = await prisma.paper.findMany({ orderBy: { viewCount: 'desc' }, take: 4, include: { book: true } });

  const staticResources = [
    { icon: '📝', title: 'Research Writing Guide', desc: 'Learn how to structure, write, and cite academic papers.', tag: 'Writing' },
    { icon: '🔬', title: 'Research Methodology', desc: 'Understand qualitative and quantitative methods.', tag: 'Methods' },
    { icon: '📊', title: 'Data Analysis Basics', desc: 'Introduction to data collection and visualization.', tag: 'Analysis' },
    { icon: '📖', title: 'Citation & Referencing', desc: 'APA, MLA, and Chicago styles explained.', tag: 'Citation' },
    { icon: '🎯', title: 'Critical Thinking Skills', desc: 'Develop analytical and evaluative thinking.', tag: 'Skills' },
    { icon: '💡', title: 'Presentation Skills', desc: 'Tips for effective academic presentations.', tag: 'Skills' },
  ];

  return (
    <div className="grid md:grid-cols-[200px_1fr] min-h-screen">
      <aside className="bg-white border-r border-gray-200 py-3 sticky top-14 h-[calc(100vh-56px)] hidden md:block">
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 py-2">Resources</p>
        <span className="sidebar-btn-active">📖 All Resources</span>
        <button className="sidebar-btn">📝 Study Guides</button>
        <button className="sidebar-btn">🔬 Research Methods</button>
        <button className="sidebar-btn">✍️ Writing Help</button>
        <Link href="/research" className="sidebar-btn mt-4">📚 Research Centre</Link>
      </aside>
      <div className="p-5">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Resources' }]} />
        <h1 className="font-serif text-xl font-semibold mb-1">Academic Resources</h1>
        <p className="text-xs text-gray-400 mb-5">Curated materials to support your academic journey.</p>

        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {staticResources.map((r, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gold hover:shadow-md transition-all">
              <div className="text-2xl mb-2">{r.icon}</div>
              <h3 className="text-sm font-semibold mb-1">{r.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{r.desc}</p>
              <span className="text-[9px] font-mono text-gold-dark">{r.tag}</span>
            </div>
          ))}
        </div>

        {resources.length > 0 && (
          <div className="mb-6">
            <h2 className="section-title">Uploaded Resources</h2>
            {resources.map(r => (
              <div key={r.id} className="flex gap-3 p-3 bg-white border border-gray-200 rounded mb-1">
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.description}</p>
                </div>
                {r.fileUrl && <a href={r.fileUrl} target="_blank" className="btn-outline text-xs self-center">Open</a>}
              </div>
            ))}
          </div>
        )}

        <h2 className="section-title">Popular Research Papers</h2>
        {papers.map(p => (
          <Link key={p.id} href={`/research/paper/${p.id}`}
            className="flex gap-2 p-2 bg-white border border-gray-200 rounded mb-1 hover:border-gold transition-all">
            <span className="font-mono text-[10px] text-gray-400">#{p.paperNumber}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{p.title}</p>
              <p className="text-[10px] text-gray-400">{p.authors} · {p.viewCount} views</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
