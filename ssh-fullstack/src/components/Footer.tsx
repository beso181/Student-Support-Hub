import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-navy text-white/25 pt-10 pb-5 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-serif font-semibold text-white text-sm mb-2">Student Support Hub</div>
            <p className="text-xs text-white/30 leading-relaxed">
              An academic platform by Al Mawakeb Schools — empowering students through research, mentorship, and innovation.
            </p>
          </div>
          <div>
            <h4 className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-3">Platform</h4>
            {['/', '/dashboard', '/research', '/resources', '/community'].map(h => (
              <Link key={h} href={h} className="block text-xs text-white/25 hover:text-gold py-0.5">
                {h === '/' ? 'Home' : h.slice(1).charAt(0).toUpperCase() + h.slice(2)}
              </Link>
            ))}
          </div>
          <div>
            <h4 className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-3">Research</h4>
            <Link href="/research/papers" className="block text-xs text-white/25 hover:text-gold py-0.5">All Papers</Link>
            <Link href="/research" className="block text-xs text-white/25 hover:text-gold py-0.5">Publications</Link>
          </div>
          <div>
            <h4 className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-3">Administration</h4>
            <Link href="/admin" className="block text-xs text-white/25 hover:text-gold py-0.5">Management Portal</Link>
          </div>
        </div>
        <div className="border-t border-white/5 pt-4 flex justify-between items-center">
          <span className="text-[10px] font-mono text-white/15">© 2025 Al Mawakeb Schools</span>
        </div>
      </div>
    </footer>
  );
}
