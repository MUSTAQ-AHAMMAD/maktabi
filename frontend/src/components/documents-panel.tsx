'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocale } from '@/i18n/locale-provider';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { Upload, FileText, Download, Trash2, Loader2, FileImage, FileArchive, File as FileIcon } from 'lucide-react';

interface Doc { id: string; originalName: string; mimeType: string; size: number; version: number; createdAt: string; }

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function iconFor(mime: string) {
  if (mime?.startsWith('image/')) return FileImage;
  if (mime?.includes('zip') || mime?.includes('compressed')) return FileArchive;
  if (mime?.includes('pdf') || mime?.includes('word') || mime?.includes('text')) return FileText;
  return FileIcon;
}

export function DocumentsPanel({ entityType, entityId }: { entityType: string; entityId: string }) {
  const { t } = useLocale();
  const { toast } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try { const r = await api.get('/documents', { params: { entityType, entityId } }); setDocs(r.data); } catch {}
  }, [entityType, entityId]);
  useEffect(() => { load(); }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        await api.post('/documents/upload', fd, { params: { entityType, entityId }, headers: { 'Content-Type': undefined } });
      }
      toast({ title: t('common.updated'), description: `${files.length} file(s)` });
      load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  const download = async (doc: Doc) => {
    try {
      const r = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a'); a.href = url; a.download = doc.originalName; a.click();
      URL.revokeObjectURL(url);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const remove = async (doc: Doc) => { if (!confirm(`${t('common.delete')}?`)) return; try { await api.delete(`/documents/${doc.id}`); load(); } catch {} };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
        {uploading ? <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" /> : <Upload className="w-6 h-6 mx-auto text-muted-foreground" />}
        <p className="text-sm text-foreground mt-2">{uploading ? t('documents.uploading') : t('documents.drop')}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t('documents.maxSize')}</p>
      </div>

      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t('documents.empty')}</p>
      ) : (
        <div className="space-y-1.5">
          {docs.map((d) => {
            const Icon = iconFor(d.mimeType);
            return (
              <div key={d.id} className="group flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/40">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{d.originalName}</p>
                  <p className="text-xs text-muted-foreground">{humanSize(d.size)}{d.version > 1 ? ` · ${t('documents.version')}${d.version}` : ''}</p>
                </div>
                <button onClick={() => download(d)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted" title={t('documents.download')}><Download className="w-4 h-4" /></button>
                <button onClick={() => remove(d)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
