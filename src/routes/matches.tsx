import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { pageHead } from '@/lib/page-head';
import { BUSINESSES } from '@/lib/businesses';
import { useBond } from '@/components/bond-state';
import { PartnerCard } from '@/components/partner-card';
import { Button } from '@/components/ui/button';
export const Route = createFileRoute('/matches')({ head: () => pageHead('My matches', 'Your mutual sales and marketing matches, saved partners and swap proposals.'), component: Matches });
function Matches() {
 const { matches, saved, proposed } = useBond();
 const [tab, setTab] = useState('Mutual');
 const list = tab === 'Mutual' ? matches.map((m) => m.business) : BUSINESSES.filter((b) => (tab === 'Saved' ? saved : proposed).includes(b.id));
 return <><div className="page-heading"><span className="label">Better, both ways</span><h1>My matches</h1><p>They have what you need. You have what they need.</p></div><div className="tab-bar" role="tablist" aria-label="Match lists">{['Mutual', 'Saved', 'Proposed'].map((t) => <Button key={t} role="tab" aria-selected={tab === t} variant={tab === t ? 'secondary' : 'ghost'} onClick={() => setTab(t)}>{t} <span className="text-xs">{t === 'Mutual' ? matches.length : t === 'Saved' ? saved.length : proposed.length}</span></Button>)}</div><div className="partner-grid">{list.map((b) => <PartnerCard key={b.id} business={b} mutual={tab === 'Mutual'} />)}</div>{!list.length && <div className="empty-state"><h2 className="font-display text-xl">No {tab.toLowerCase()} partners yet</h2><Button asChild className="mt-4"><Link to="/discover">Discover partners</Link></Button></div>}</>;
}
