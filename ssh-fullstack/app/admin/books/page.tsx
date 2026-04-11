import prisma from '@/lib/db';

export default async function AdminBooksPage() {
  const books = await prisma.book.findMany({
    include: {
      club: true,
      academicYear: true,
      _count: { select: { papers: true, chapters: true, parts: true } },
    },
  });

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold mb-1">Books ({books.length})</h1>
      <p className="text-xs text-gray-400 mb-5">Manage publications</p>

      <div className="space-y-3">
        {books.map(b => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">{b.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">{b.description}</p>
                <div className="flex gap-3 text-[10px] text-gray-400">
                  <span>🏛 {b.club.name}</span>
                  <span>📅 {b.academicYear.label}</span>
                  <span>📄 {b._count.papers} papers</span>
                  <span>📂 {b._count.chapters} chapters</span>
                  <span>📚 {b._count.parts} parts</span>
                </div>
              </div>
              <span className="tag ml-3">{b.publicationYear}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
