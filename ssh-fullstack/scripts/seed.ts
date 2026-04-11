import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Create Supabase admin user ──
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const adminEmail = process.env.ADMIN_EMAIL || 'basil.mustafa@amg.sch.ae';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Basilmustafa265';
  const adminName = process.env.ADMIN_NAME || 'Basil Mustafa';

  // Create admin user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: adminName },
  });

  if (authError && !authError.message.includes('already')) {
    console.error('Auth error:', authError.message);
  }

  const userId = authUser?.user?.id;
  if (userId) {
    await prisma.profile.upsert({
      where: { id: userId },
      update: { role: Role.SUPER_ADMIN },
      create: { id: userId, email: adminEmail, fullName: adminName, role: Role.SUPER_ADMIN },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  }

  // ── Clubs ──
  const clubs = await Promise.all([
    prisma.club.upsert({ where: { slug: 'amg' }, update: {}, create: { name: 'AMG — Al Mawakeb Al Garhoud', slug: 'amg', description: 'The founding branch of the AMRC network.' } }),
    prisma.club.upsert({ where: { slug: 'amo2' }, update: {}, create: { name: 'AMO2 — Al Mawakeb O2', slug: 'amo2', description: 'The Al Mawakeb O2 campus branch.' } }),
    prisma.club.upsert({ where: { slug: 'amag' }, update: {}, create: { name: 'AMAG — Association of Geopolitics', slug: 'amag', description: 'Exploring international relations and global affairs.' } }),
  ]);
  console.log(`✅ ${clubs.length} clubs`);

  // ── Academic Years ──
  const years = await Promise.all([
    prisma.academicYear.create({ data: { label: '2023–2024', startYear: 2023, endYear: 2024 } }),
    prisma.academicYear.create({ data: { label: '2024–2025', startYear: 2024, endYear: 2025 } }),
    prisma.academicYear.create({ data: { label: '2025–2026', startYear: 2025, endYear: 2026 } }),
  ]);
  console.log(`✅ ${years.length} academic years`);

  // ── Books ──
  const amg = clubs.find(c => c.slug === 'amg')!;
  const amo2 = clubs.find(c => c.slug === 'amo2')!;
  const amag = clubs.find(c => c.slug === 'amag')!;

  const bookRor = await prisma.book.create({
    data: {
      title: 'Reigns of Revolution',
      description: 'An anthology testament to the riptides of change and a memoir to the winds of revolution across 12 chapters.',
      clubId: amg.id, academicYearId: years[1].id, publicationYear: 2025,
      editors: 'Meera Al Jowhari, Yamin Hakawati, Reem Daou, Mahinour El Sisy, Rayan Abu Eideh',
    },
  });

  const bookAmo2Ed1 = await prisma.book.create({
    data: {
      title: 'AMO2 Anthology: Unravel the Past (Edition 1)',
      description: 'Over 55 imaginative narratives reimagining historical events through creative fiction.',
      clubId: amo2.id, academicYearId: years[0].id, publicationYear: 2024,
      editors: 'AMO2 Team',
    },
  });

  const bookAmo2Ed2 = await prisma.book.create({
    data: {
      title: 'AMO2 Anthology 2.0: Beneath the Surface, Beyond the Page',
      description: 'Students reimagine pivotal 17th-18th century moments with original plots and characters.',
      clubId: amo2.id, academicYearId: years[1].id, publicationYear: 2025,
      editors: 'Joseph Asfhan, Jamelia Attia, Ahmad Akel, Sophia Farkhoury',
    },
  });

  const bookAmag = await prisma.book.create({
    data: {
      title: 'Between Order and Chaos',
      description: 'The inaugural geopolitics book exploring thinkers whose ideas shape global reality.',
      clubId: amag.id, academicYearId: years[2].id, publicationYear: 2026,
      editors: 'Lamar Otabashi, Qusai Aldaour, Lily Bayomy, Ahmad Zbeeb',
    },
  });

  console.log(`✅ 4 books`);

  // ── Parts ──
  const part1 = await prisma.bookPart.create({ data: { title: 'Part 1', partNumber: 1, bookId: bookRor.id } });
  const part2 = await prisma.bookPart.create({ data: { title: 'Part 2', partNumber: 2, bookId: bookRor.id } });
  const partAmo2 = await prisma.bookPart.create({ data: { title: 'Full Book', partNumber: 1, bookId: bookAmo2Ed1.id } });
  const partAmo2v2 = await prisma.bookPart.create({ data: { title: 'Full Book', partNumber: 1, bookId: bookAmo2Ed2.id } });
  const partAmag = await prisma.bookPart.create({ data: { title: 'Full Book', partNumber: 1, bookId: bookAmag.id } });

  // ── Chapters (sample — you would create all) ──
  const chRor = await Promise.all([
    prisma.chapter.create({ data: { title: 'Historical & Political Revolutions', chapterNumber: 1, bookId: bookRor.id, partId: part1.id } }),
    prisma.chapter.create({ data: { title: 'Cultural & Social Revolutions', chapterNumber: 2, bookId: bookRor.id, partId: part1.id } }),
    prisma.chapter.create({ data: { title: 'Scientific & Technological Revolutions', chapterNumber: 4, bookId: bookRor.id, partId: part1.id } }),
    prisma.chapter.create({ data: { title: 'Media & Communication Revolutions', chapterNumber: 6, bookId: bookRor.id, partId: part2.id } }),
    prisma.chapter.create({ data: { title: 'Music Revolutions', chapterNumber: 8, bookId: bookRor.id, partId: part2.id } }),
  ]);

  const chAmo2 = await prisma.chapter.create({ data: { title: 'Historical Narratives', chapterNumber: 1, bookId: bookAmo2Ed1.id, partId: partAmo2.id } });
  const chAmo2v2 = await prisma.chapter.create({ data: { title: 'Historical Narratives (17th-18th Century)', chapterNumber: 1, bookId: bookAmo2Ed2.id, partId: partAmo2v2.id } });

  const chAmag = await Promise.all([
    prisma.chapter.create({ data: { title: 'Geopolitical Literature', chapterNumber: 1, bookId: bookAmag.id, partId: partAmag.id } }),
    prisma.chapter.create({ data: { title: 'The Geopolitics of Earth', chapterNumber: 2, bookId: bookAmag.id, partId: partAmag.id } }),
    prisma.chapter.create({ data: { title: 'Geopolitics from Students\' Eyes', chapterNumber: 5, bookId: bookAmag.id, partId: partAmag.id } }),
  ]);

  console.log(`✅ Chapters created`);

  // ── Sample Papers ──
  const samplePapers = [
    { paperNumber: 1, title: 'The Iraqi Revolution and its Global Impact', authors: 'Zain Ichtay, Mustafa Tawfiq', category: 'Historical & Political Revolutions', year: 2025, bookId: bookRor.id, partId: part1.id, chapterId: chRor[0].id, clubId: amg.id, academicYearId: years[1].id, abstract: 'An analysis of the Iraqi Revolution and its far-reaching consequences on global geopolitics.' },
    { paperNumber: 79, title: 'The End Of Julius Caesar', authors: 'Yassin Fergany', category: 'Historical Narratives', year: 2024, bookId: bookAmo2Ed1.id, partId: partAmo2.id, chapterId: chAmo2.id, clubId: amo2.id, academicYearId: years[0].id, abstract: 'A narrative reimagining the assassination of Julius Caesar.' },
    { paperNumber: 132, title: 'All About Oswald Spengler', authors: 'AMAG Writers', category: 'Geopolitical Literature', year: 2026, bookId: bookAmag.id, partId: partAmag.id, chapterId: chAmag[0].id, clubId: amag.id, academicYearId: years[2].id, abstract: 'An exploration of Oswald Spengler and his cyclical theory of civilizations.' },
    { paperNumber: 162, title: 'The Silence After the Roar', authors: 'Lina Gazar', category: 'Historical Narratives (17th-18th Century)', year: 2025, bookId: bookAmo2Ed2.id, partId: partAmo2v2.id, chapterId: chAmo2v2.id, clubId: amo2.id, academicYearId: years[1].id, abstract: 'A narrative exploring the Cascadia earthquake of 1700.' },
  ];

  for (const p of samplePapers) {
    await prisma.paper.create({ data: p });
  }
  console.log(`✅ ${samplePapers.length} sample papers (seed with full data separately)`);

  console.log('\n🎉 Seed complete! To import all 200 papers, run the bulk import script.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
