import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { BUSINESSES } from '@/lib/businesses';
import { pageHead } from '@/lib/page-head';
import { useSwapkit } from '@/components/swapkit-state';
import { SkillPicker } from '@/components/skill-picker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
export const Route = createFileRoute('/profiles')({ validateSearch: (search: Record<string, unknown>): { member?: string } => typeof search['member'] === 'string' ? { member: search['member'] } : {}, head: () => pageHead('Profiles', 'Business profiles and sales and marketing skills in your Swapkit circle.'), component: Profiles });
function Profiles() {
 const { member } = Route.useSearch();
 const { profile, setProfile, offers, setOffers, needs, setNeeds, propose, proposed } = useSwapkit();
 const [draft, setDraft] = useState(profile);
 const [saved, setSaved] = useState(false);
 const business = BUSINESSES.find((b) => b.id === member);
 if (member) return <><Button asChild variant="ghost"><Link to="/discover"><ArrowLeft />All partners</Link></Button>{business ? <><div className="page-heading mt-6"><span className="label">{business.focus}</span><h1>{business.name}</h1><p>{business.owner} · {business.city}</p></div><p className="max-w-xl text-muted-foreground">{business.blurb}</p><div className="skills-columns"><section><h2 className="section-title">Offers</h2>{business.offers.map((s) => <span key={s} className="chip chip-get">{s}</span>)}</section><section><h2 className="section-title">Looking for</h2>{business.needs.map((s) => <span key={s} className="chip chip-give">{s}</span>)}</section></div><Button onClick={() => propose(business.id)} disabled={proposed.includes(business.id)}>{proposed.includes(business.id) ? 'Proposed' : 'Propose a swap'}</Button></> : <div className="empty-state">This example member was not found.</div>}</>;
 return <><div className="page-heading"><span className="label">Your place in the circle</span><h1>My profile</h1><p>Your sales and marketing strengths, in one place.</p></div><form onSubmit={(e) => { e.preventDefault(); setProfile(draft); setSaved(true); }} className="profile-form"><div className="form-grid">{([['name', 'Business name'], ['owner', 'Your name'], ['city', 'City']] as const).map(([key, label]) => <label key={key} className="space-y-2 text-sm font-semibold">{label}<Input required value={draft[key]} onChange={(e) => { setSaved(false); setDraft({ ...draft, [key]: e.target.value }); }} /></label>)}<label className="space-y-2 text-sm font-semibold sm:col-span-2">About your business<Textarea required value={draft.blurb} onChange={(e) => { setSaved(false); setDraft({ ...draft, blurb: e.target.value }); }} /></label></div><Button type="submit" className="mt-5">{saved ? <><Check />Saved in preview</> : 'Save profile'}</Button></form><div className="skills-columns"><section><h2 className="section-title">I can offer</h2><SkillPicker selected={offers} onChange={setOffers} /></section><section><h2 className="section-title">I’m looking for</h2><SkillPicker selected={needs} onChange={setNeeds} /></section></div></>;
}
