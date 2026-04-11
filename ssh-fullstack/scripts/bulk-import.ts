/**
 * Bulk Import Script
 * 
 * Imports all 200 papers from the existing SEED_PAPERS data
 * and optionally uploads PDFs to Supabase Storage.
 * 
 * Usage:
 *   1. First run the seed script: npm run db:seed
 *   2. Place paper PDFs in ./pdf-source/paper-1.pdf, paper-2.pdf, etc.
 *   3. Run: npx tsx scripts/bulk-import.ts
 *   4. Add --upload-pdfs flag to also upload PDFs to Supabase Storage
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// You would paste the full SEED_PAPERS array here from the static site,
// or load it from a JSON file exported from the old site.
// For now, this shows the structure:

interface SeedPaper {
  id: string;
  num: number;
  title: string;
  authors: string;
  abstract: string;
  keywords: string[];
  category: string;
  year: number;
  bookId: string;
  partId: string;
  clubId: string;
  academicYearId: string;
  pdf: string;
}

async function main() {
  const uploadPdfs = process.argv.includes('--upload-pdfs');

  // Load papers data
  const dataPath = path.join(__dirname, 'papers-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ papers-data.json not found. Export SEED_PAPERS from the old site:');
    console.error('   In browser console on old site: copy(JSON.stringify(SEED_PAPERS))');
    console.error('   Save to scripts/papers-data.json');
    process.exit(1);
  }

  const papers: SeedPaper[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📄 Found ${papers.length} papers to import`);

  // Get lookup maps for existing DB records
  const clubs = await prisma.club.findMany();
  const years = await prisma.academicYear.findMany();
  const books = await prisma.book.findMany();
  const parts = await prisma.bookPart.findMany();
  const chapters = await prisma.chapter.findMany();

  const clubMap = new Map(clubs.map(c => [c.slug, c.id]));
  const bookMap = new Map<string, string>();
  const partMap = new Map<string, string>();
  const chapterMap = new Map<string, string>();

  // Build mappings from old IDs to new UUIDs
  // This depends on how the seed script created them
  // You may need to adjust based on your actual seed output
  
  let imported = 0;
  let skipped = 0;

  for (const p of papers) {
    // Find matching book, part, chapter by title/category
    const book = books.find(b => {
      if (p.bookId === 'book_ror') return b.title.includes('Reigns');
      if (p.bookId === 'book_amo2_2024') return b.title.includes('Edition 1');
      if (p.bookId === 'book_amo2_2025') return b.title.includes('2.0');
      if (p.bookId === 'book_amag_geo') return b.title.includes('Order and Chaos');
      return false;
    });

    if (!book) { skipped++; continue; }

    const club = clubs.find(c => {
      if (p.clubId === 'club_amg') return c.slug === 'amg';
      if (p.clubId === 'club_amo2') return c.slug === 'amo2';
      if (p.clubId === 'club_amag') return c.slug === 'amag';
      return false;
    });

    if (!club) { skipped++; continue; }

    const year = years.find(y => {
      if (p.academicYearId === 'ay_2024') return y.startYear === 2023;
      if (p.academicYearId === 'ay_2025') return y.startYear === 2024;
      if (p.academicYearId === 'ay_2026') return y.startYear === 2025;
      return false;
    });

    if (!year) { skipped++; continue; }

    const part = parts.find(pt => pt.bookId === book.id);
    const chapter = chapters.find(ch => ch.bookId === book.id && ch.title === p.category);

    // Check if paper already exists
    const exists = await prisma.paper.findFirst({ where: { paperNumber: p.num } });
    if (exists) { skipped++; continue; }

    let pdfUrl: string | null = null;

    // Upload PDF if flag set and file exists
    if (uploadPdfs) {
      const pdfPath = path.join(__dirname, '..', 'pdf-source', `paper-${p.num}.pdf`);
      if (fs.existsSync(pdfPath)) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const fileBuffer = fs.readFileSync(pdfPath);
        const storagePath = `papers/paper-${p.num}.pdf`;

        const { error } = await supabase.storage
          .from('papers')
          .upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true });

        if (!error) {
          const { data } = supabase.storage.from('papers').getPublicUrl(storagePath);
          pdfUrl = data.publicUrl;
        }
      }
    }

    await prisma.paper.create({
      data: {
        paperNumber: p.num,
        title: p.title,
        authors: p.authors,
        abstract: p.abstract || null,
        keywords: p.keywords || [],
        category: p.category || null,
        year: p.year,
        bookId: book.id,
        partId: part?.id || null,
        chapterId: chapter?.id || null,
        clubId: club.id,
        academicYearId: year.id,
        pdfUrl,
      },
    });
    imported++;

    if (imported % 20 === 0) console.log(`  ... ${imported} imported`);
  }

  console.log(`\n✅ Done: ${imported} imported, ${skipped} skipped`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
