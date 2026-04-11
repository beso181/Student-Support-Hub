import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const paperId = formData.get('paperId') as string;

    if (!file || !paperId) {
      return NextResponse.json({ error: 'Missing file or paperId' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const filePath = `papers/${paperId}/${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('papers')
      .upload(filePath, buffer, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('papers').getPublicUrl(filePath);

    await prisma.paper.update({
      where: { id: paperId },
      data: { pdfUrl: urlData.publicUrl },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: { adminId: session.profile.id, action: 'upload_pdf', details: { paperId, filePath } },
    });

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
