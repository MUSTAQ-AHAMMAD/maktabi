'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocale } from '@/i18n/locale-provider';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { MessageSquare, Plus, Send, Search } from 'lucide-react';

interface Convo { id: string; name: string; participants: any[]; lastMessage?: { body: string; createdAt: string } | null; unread: number; }
interface Msg { id: string; body: string; createdAt: string; sender: { id: string; firstName: string; lastName: string }; }

export default function MessagesPage() {
  const { t, locale } = useLocale();
  const { user } = useAuthStore();
  const [convos, setConvos] = useState<Convo[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [people, setPeople] = useState<any[]>([]);
  const [peopleSearch, setPeopleSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConvos = useCallback(async () => { try { const r = await api.get('/messages/conversations'); setConvos(r.data); } catch {} }, []);
  const loadMessages = useCallback(async (id: string) => { try { const r = await api.get(`/messages/${id}`); setMessages(r.data); } catch {} }, []);

  useEffect(() => { loadConvos().finally(() => setLoading(false)); api.get('/users').then(r => setPeople(r.data)).catch(() => {}); }, [loadConvos]);

  // poll active conversation + convo list
  useEffect(() => {
    if (!active) return;
    loadMessages(active);
    const iv = setInterval(() => { loadMessages(active); loadConvos(); }, 5000);
    return () => clearInterval(iv);
  }, [active, loadMessages, loadConvos]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!draft.trim() || !active) return;
    const body = draft; setDraft('');
    try { await api.post(`/messages/${active}`, { body }); loadMessages(active); loadConvos(); } catch {}
  };
  const startChat = async (targetUserId: string) => {
    try { const r = await api.post('/messages/direct', { targetUserId }); setNewOpen(false); await loadConvos(); setActive(r.data.id); } catch {}
  };

  const timeFmt = (d: string) => new Date(d).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  const activeConvo = convos.find(c => c.id === active);
  const filteredPeople = people.filter(p => p.id !== user?.id && `${p.firstName} ${p.lastName}`.toLowerCase().includes(peopleSearch.toLowerCase()));

  return (
    <AppLayout title={t('messages.title')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><MessageSquare className="w-5 h-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold text-foreground">{t('messages.title')}</h1><p className="text-sm text-muted-foreground">{t('messages.subtitle')}</p></div>
        </div>
        <Button onClick={() => setNewOpen(true)}><Plus className="w-4 h-4 me-1.5" /> {t('messages.newChat')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          {loading ? <div className="p-3 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
            : convos.length === 0 ? <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-4 text-center">{t('messages.noConversations')}</div>
            : <div className="flex-1 overflow-y-auto divide-y divide-border">
                {convos.map(c => (
                  <button key={c.id} onClick={() => setActive(c.id)} className={`w-full text-start p-3 hover:bg-muted/50 transition-colors flex items-center gap-3 ${active === c.id ? 'bg-primary/5' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">{c.name.slice(0, 2).toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-foreground truncate">{c.name}</p>{c.unread > 0 && <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 shrink-0">{c.unread}</span>}</div>
                      <p className="text-xs text-muted-foreground truncate">{c.lastMessage?.body || '—'}</p>
                    </div>
                  </button>
                ))}
              </div>}
        </div>

        {/* Thread */}
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          {!active ? <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground"><MessageSquare className="w-10 h-10 mb-2 opacity-40" /><p className="text-sm">{t('messages.selectConversation')}</p></div>
            : <>
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{activeConvo?.name.slice(0, 2).toUpperCase()}</div>
                  <p className="font-semibold text-foreground text-sm">{activeConvo?.name}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map(m => {
                    const mine = m.sender.id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${mine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                          {!mine && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.sender.firstName} {m.sender.lastName}</p>}
                          <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                          <p className={`text-[10px] mt-0.5 ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'} text-end`}>{timeFmt(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div className="p-3 border-t border-border flex items-center gap-2">
                  <Input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={t('messages.typeMessage')} className="flex-1" />
                  <Button size="icon" onClick={send} disabled={!draft.trim()}><Send className="w-4 h-4" /></Button>
                </div>
              </>}
        </div>
      </div>

      {/* New chat dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('messages.newChat')}</DialogTitle></DialogHeader>
          <div className="relative">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={peopleSearch} onChange={e => setPeopleSearch(e.target.value)} placeholder={`${t('common.search')}…`} className="ltr:pl-9 rtl:pr-9" />
          </div>
          <div className="max-h-72 overflow-y-auto -mx-2">
            {filteredPeople.map(p => (
              <button key={p.id} onClick={() => startChat(p.id)} className="w-full text-start px-3 py-2.5 hover:bg-muted/50 rounded-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{p.firstName[0]}{p.lastName[0]}</div>
                <div><p className="text-sm font-medium text-foreground">{p.firstName} {p.lastName}</p><p className="text-xs text-muted-foreground">{p.role?.replace(/_/g, ' ')}</p></div>
              </button>
            ))}
            {filteredPeople.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{t('common.noData')}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
