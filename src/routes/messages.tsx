import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Send, MessageSquare, Handshake } from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import { BUSINESSES } from '@/lib/businesses';
import { useSwapkit } from '@/components/swapkit-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export const Route = createFileRoute('/messages')({ head: () => pageHead('Messages', 'Discuss mutual sales and marketing swaps with your business partners.'), component: Messages });
function Messages() {
 const { messages, proposed, sendMessage, cooperations, startCooperation } = useSwapkit();
 const [selected, setSelected] = useState<string | null>(null);
 const [text, setText] = useState('');
 const ids = [...new Set([...proposed, ...messages.map((m) => m.businessId)])];
 const activeId = selected || ids[0];
 const business = BUSINESSES.find((b) => b.id === activeId);
 const active = cooperations.some((c) => c.businessId === activeId);
 return <><div className="page-heading"><span className="label">Start a conversation</span><h1>Messages</h1><p>Good partnerships start with common ground.</p></div>{!business ? <div className="empty-state"><MessageSquare className="mx-auto mb-4 size-8 text-secondary" /><h2 className="font-display text-xl">No conversations yet</h2><p className="my-3 text-sm text-muted-foreground">Your swap proposals will appear here.</p><Button asChild><Link to="/discover">Find a partner</Link></Button></div> : <div className="inbox"><aside className="conversation-list">{ids.map((id) => { const b = BUSINESSES.find((item) => item.id === id); return b ? <Button key={id} variant={activeId === id ? 'secondary' : 'ghost'} className="h-auto w-full justify-start whitespace-normal px-4 py-4 text-left" onClick={() => setSelected(id)}><span><strong className="block">{b.name}</strong><span className="block text-xs font-normal">{b.owner}</span></span></Button> : null; })}</aside><section className="conversation"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div><h2 className="font-semibold">{business.name}</h2><p className="text-xs text-muted-foreground">{business.owner} · Preview conversation</p></div><Button variant="outline" size="sm" disabled={active} onClick={() => startCooperation(business.id, 'Sales & marketing skill swap')}><Handshake />{active ? 'Cooperation created' : 'Create cooperation'}</Button></div><div className="message-stream" aria-live="polite">{messages.filter((m) => m.businessId === activeId).map((m) => <p key={m.id} className="message-bubble">{m.text}<span className="mt-2 block text-xs opacity-70">You · Preview only</span></p>)}</div><form className="flex gap-2 border-t p-4" onSubmit={(e) => { e.preventDefault(); sendMessage(business.id, text); setText(''); }}><Input aria-label="Message" placeholder="Write a message…" value={text} onChange={(e) => setText(e.target.value)} /><Button type="submit" size="icon" disabled={!text.trim()} aria-label="Send preview message"><Send /></Button></form></section></div>}</>;
}
