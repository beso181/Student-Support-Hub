'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

export default function AdminUploadPage() {
  const [paperId, setPaperId] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !paperId) { toast.error('Select a file and enter paper ID'); return; }
    if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('paperId', paperId);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`PDF uploaded! URL: ${data.url}`);
      setPaperId('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold mb-1">Upload PDF</h1>
      <p className="text-xs text-gray-400 mb-5">Upload a PDF for a specific paper. The file will be stored in Supabase Storage.</p>

      <div className="max-w-lg bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <label className="block font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">Paper ID</label>
          <input
            value={paperId} onChange={e => setPaperId(e.target.value)}
            placeholder="Paste the paper UUID here"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-gold outline-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">Find the paper ID in the Papers management page.</p>
        </div>

        <div className="mb-4">
          <label className="block font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">PDF File</label>
          <input ref={fileRef} type="file" accept="application/pdf"
            className="w-full text-sm border border-gray-300 rounded-md p-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-gold file:text-white" />
        </div>

        <button onClick={handleUpload} disabled={uploading}
          className={`btn-navy w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-2">Bulk Upload Instructions</h3>
        <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
          <li>Go to your Supabase dashboard → Storage → papers bucket</li>
          <li>Create a folder for each paper using the paper UUID as the folder name</li>
          <li>Upload the PDF into that folder</li>
          <li>Copy the public URL and update the paper record via the API</li>
          <li>Or use the seed script to bulk-import all 200 papers with their PDFs</li>
        </ol>
      </div>
    </div>
  );
}
