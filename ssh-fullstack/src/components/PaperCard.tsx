import Link from 'next/link';
import type { PaperWithRelations } from '@/lib/types';

const colors: Record<string, string> = {
  "Historical & Political Revolutions": "#8b2020",
  "Historical Narratives": "#9333ea",
  "Geopolitical Literature": "#1e40af",
  "Scientific & Technological Revolutions": "#1a6847",
};

export default function PaperCard({ paper }: { paper: PaperWithRelations }) {
  const color = colors[paper.category || ''] || '#6b7280';
  return (
    <Link href={`/research/paper/${paper.id}`} className="card group">
      <div className="h-[3px]" style={{ background: color }} />
      <div className="p-3.5">
        <span className="tag">#{paper.paperNumber}</span>
        <h3 className="font-sans font-semibold text-[13px] leading-tight mt-1.5 mb-1 line-clamp-2 group-hover:text-gold-dark transition-colors">
          {paper.title}
        </h3>
        <p className="text-[11px] text-gray-500 mb-1">{paper.authors}</p>
        <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{paper.abstract}</p>
        <div className="flex gap-2 text-[10px] text-gray-400">
          <span>📖 {paper.book?.title?.split(':')[0]}</span>
          <span>📅 {paper.year}</span>
        </div>
        {paper.category && (
          <div className="mt-1.5">
            <span className="tag">{paper.category}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
