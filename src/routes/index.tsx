import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, HeartHandshake, Bookmark, Handshake, MessageSquare } from "lucide-react";
import { useBond } from "@/components/bond-state";
import { PartnerCard } from "@/components/partner-card";
import { Button } from "@/components/ui/button";
import collaboration from "@/assets/business-collaboration.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Bond sales & marketing circle" },
      {
        name: "description",
        content:
          "Trade sales and marketing muscle with small business owners who need what you offer and offer what you need.",
      },
      { property: "og:title", content: "Bond — Swap sales & marketing skills" },
      {
        property: "og:description",
        content: "Find mutual sales and marketing swaps with local small business owners.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { profile, matches, saved, messages, cooperations } = useBond();
  const stats = [
    { label: "Mutual matches", value: matches.length, icon: HeartHandshake, to: "/matches" },
    { label: "Saved partners", value: saved.length, icon: Bookmark, to: "/matches" },
    { label: "Conversations", value: new Set(messages.map((m) => m.businessId)).size, icon: MessageSquare, to: "/messages" },
    { label: "Cooperations", value: cooperations.length, icon: Handshake, to: "/cooperation" },
  ] as const;
  return <>
    <div className="page-heading"><span className="label">Your business, connected</span><h1>Overview</h1><p>Welcome back, {profile.owner.split(" ")[0]}. Let’s grow your circle.</p></div>
    <section className="overview-cover"><img src={collaboration} width={1536} height={768} alt="Small business owners discussing sales and marketing around a studio table" /><div className="cover-shade" /><div className="cover-copy"><span className="text-xs font-semibold uppercase">Sales &amp; marketing, together</span><h2 className="mt-3 font-display text-4xl">Bond.<br />Different strengths.<br /><em>Shared growth.</em></h2><Button asChild className="mt-6"><Link to="/discover">Discover your partner<ArrowUpRight /></Link></Button></div></section>
    <section className="stats-grid" aria-label="Your circle at a glance">{stats.map(({ label, value, icon: Icon, to }) => <Link to={to} key={label} className="stat-item"><div className="flex items-center justify-between"><Icon className="size-5 text-secondary" /><ArrowUpRight className="size-4 text-muted-foreground" /></div><strong className="mt-4 block font-display text-3xl">{value}</strong><span className="text-xs text-muted-foreground">{label}</span></Link>)}</section>
    <section className="mt-10"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><span className="label">Made for each other</span><h2 className="font-display text-2xl">Your mutual matches</h2></div><Button asChild variant="ghost"><Link to="/matches">View all matches<ArrowUpRight /></Link></Button></div><div className="partner-grid">{matches.slice(0, 3).map(({ business }) => <PartnerCard key={business.id} business={business} mutual />)}</div>{!matches.length && <p className="text-muted-foreground">No mutual matches yet. Update your sales and marketing skills in your profile.</p>}</section>
  </>;
}
