import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.profile.role)) {
    redirect('/auth/login?redirect=/admin');
  }

  return (
    <>
      <Navbar />
      <div className="grid md:grid-cols-[200px_1fr] min-h-[calc(100vh-56px)]">
        <aside className="bg-white border-r border-gray-200 py-3 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 px-4 py-2">Administration</p>
          <Link href="/admin" className="sidebar-btn">📊 Dashboard</Link>
          <Link href="/admin/analytics" className="sidebar-btn">📈 Analytics</Link>
          <Link href="/admin/papers" className="sidebar-btn">📄 Papers</Link>
          <Link href="/admin/books" className="sidebar-btn">📚 Books</Link>
          <Link href="/admin/upload" className="sidebar-btn">⬆️ Upload PDF</Link>
          <div className="px-4 mt-6">
            <p className="text-[10px] text-gray-400 mb-1">Logged in as</p>
            <p className="text-xs font-medium">{session.profile.fullName}</p>
            <p className="text-[10px] text-gray-400">{session.profile.role}</p>
          </div>
        </aside>
        <main className="bg-gray-50 p-5">{children}</main>
      </div>
    </>
  );
}
