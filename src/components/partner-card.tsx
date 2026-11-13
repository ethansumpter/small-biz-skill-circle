import { Bookmark, ArrowUpRight, Check, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { type Business } from "@/lib/businesses";
import { useBond } from "./bond-state";

export function PartnerCard({ business, mutual = false }: { business: Business; mutual?: boolean }) {
  const { saved, toggleSaved, proposed, propose, offers, needs } = useBond();
  const theyGive = business.offers.filter((skill) => needs.includes(skill));
  const youGive = business.needs.filter((skill) => offers.includes(skill));
  return <article className="partner-card">
    <div className="flex justify-between gap-3"><span className="avatar">{business.owner.split(" ").map((word) => word[0]).join("")}</span><Button variant="ghost" size="icon" aria-label={`${saved.includes(business.id) ? "Unsave" : "Save"} ${business.name}`} aria-pressed={saved.includes(business.id)} onClick={() => toggleSaved(business.id)}><Bookmark className={saved.includes(business.id) ? "fill-primary text-primary" : ""} /></Button></div>
    <span className="mt-4 text-xs font-semibold text-secondary">{mutual ? "Two-way match" : business.focus}</span>
    <h3 className="mt-1 font-display text-xl">{business.name}</h3>
    <p className="mt-1 text-xs text-muted-foreground">{business.owner} <span className="mx-1">·</span><MapPin className="inline size-3" /> {business.city}</p>
    <p className="my-4 text-sm text-muted-foreground">{business.blurb}</p>
    <div className="space-y-3"><div><span className="label">{mutual ? "They give you" : "Offers"}</span>{(mutual ? theyGive : business.offers).map((skill) => <span key={skill} className="chip chip-get chip-sm">{skill}</span>)}</div><div><span className="label">{mutual ? "You give them" : "Looking for"}</span>{(mutual ? youGive : business.needs).map((skill) => <span key={skill} className="chip chip-give chip-sm">{skill}</span>)}</div></div>
    <div className="mt-auto flex gap-2 pt-5"><Button className="flex-1" onClick={() => propose(business.id)} disabled={proposed.includes(business.id)}>{proposed.includes(business.id) ? <><Check />Proposed</> : <>Propose a swap<ArrowUpRight /></>}</Button><Button asChild variant="outline" size="icon" title={`View ${business.name}`}><Link to="/profiles" search={{ member: business.id }} aria-label={`View ${business.name}`}><ArrowUpRight /></Link></Button></div>
  </article>;
}