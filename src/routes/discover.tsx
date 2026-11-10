import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { BUSINESSES, SKILL_GROUPS } from '@/lib/businesses';
import { pageHead } from '@/lib/page-head';
import { Input } from '@/components/ui/input';
import { PartnerCard } from '@/components/partner-card';
export const Route = createFileRoute('/discover')({ head: () => pageHead('Discover partner', 'Discover small business partners to swap sales and marketing expertise.'), component: Discover });
function Discover() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All');
  const businesses = BUSINESSES.filter((b) => `${b.name} ${b.owner} ${b.city} ${b.offers.join(' ')}`.toLowerCase().includes(query.toLowerCase()) && (group === 'All' || SKILL_GROUPS.some((g) => g.name === group && b.offers.some((s) => (g.skills as readonly string[]).includes(s)))));
  return <><div className="page-heading"><span className="label">Grow together</span><h1>Discover partner</h1><p>A different strength. A shared ambition.</p></div><div className="filter-bar"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="h-10 pl-10" aria-label="Search partners" placeholder="Search by business, city or skill" value={query} onChange={(e) => setQuery(e.target.value)} /></div><select className="form-select" aria-label="Function" value={group} onChange={(e) => setGroup(e.target.value)}><option>All</option><option>Sales</option><option>Marketing</option></select><span className="text-sm text-muted-foreground">{businesses.length} partners</span></div><div className="partner-grid">{businesses.map((b) => <PartnerCard key={b.id} business={b} />)}</div>{!businesses.length && <div className="empty-state">No partners found. Try another city or skill.</div>}</>;
}
