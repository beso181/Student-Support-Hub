import Breadcrumbs from '@/components/Breadcrumbs';
import prisma from '@/lib/db';

export default async function CommunityPage() {
  const [paperCount, clubCount, authorCount] = await Promise.all([
    prisma.paper.count(),
    prisma.club.count(),
    prisma.paper.findMany({ select: { authors: true }, distinct: ['authors'] }).then(r => r.length),
  ]);

  return (
    <div className="grid md:grid-cols-[200px_1fr] min-h-screen">
      <aside className="bg-white border-r border-gray-200 py-3 sticky top-14 h-[calc(100vh-56px)] hidden md:block">
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 py-2">Community</p>
        <span className="sidebar-btn-active">🏠 Overview</span>
        <button className="sidebar-btn">🤝 Mentorship</button>
        <button className="sidebar-btn">🎓 Alumni Network</button>
        <button className="sidebar-btn">💡 Incubator</button>
      </aside>
      <div className="p-5">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Community' }]} />
        <h1 className="font-serif text-xl font-semibold mb-1">Community Hub</h1>
        <p className="text-xs text-gray-400 mb-5">Connect with mentors, alumni, and fellow researchers.</p>

        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {[
            { icon: '🤝', title: 'Mentorship Program', desc: 'Get paired with experienced mentors for academic guidance. Applications opening soon.', tag: 'Coming Soon' },
            { icon: '🎓', title: 'Alumni Network', desc: 'Connect with graduates. Share experiences and build relationships.', tag: 'Coming Soon' },
            { icon: '💡', title: 'Student Incubator', desc: 'Launch student-led research projects with faculty support.', tag: 'Coming Soon' },
          ].map((r, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gold hover:shadow-md transition-all">
              <div className="text-2xl mb-2">{r.icon}</div>
              <h3 className="text-sm font-semibold mb-1">{r.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{r.desc}</p>
              <span className="text-[9px] font-mono text-gold-dark">{r.tag}</span>
            </div>
          ))}
        </div>

        <h2 className="section-title">Our Research Community</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { n: paperCount, l: 'Papers Published', gold: true },
            { n: clubCount, l: 'Active Clubs' },
            { n: authorCount, l: 'Contributors' },
            { n: 4, l: 'Books Published' },
          ].map(s => (
            <div key={s.l} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className={`font-serif text-xl font-semibold ${s.gold ? 'text-gold-dark' : 'text-navy'}`}>{s.n}</div>
              <div className="text-[9px] text-gray-400 uppercase">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
