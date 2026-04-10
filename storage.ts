import type { Paper, Book, Club, AcademicYear, Chapter, BookPart, Profile } from '@prisma/client';

export type PaperWithRelations = Paper & {
  book: Book;
  club: Club;
  academicYear: AcademicYear;
  chapter?: Chapter | null;
  part?: BookPart | null;
};

export type BookWithRelations = Book & {
  club: Club;
  academicYear: AcademicYear;
  parts: BookPart[];
  chapters: Chapter[];
  _count: { papers: number };
};

export type { Paper, Book, Club, AcademicYear, Chapter, BookPart, Profile };
