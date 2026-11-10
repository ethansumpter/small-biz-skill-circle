import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SKILL_GROUPS, findMatches } from "@/lib/businesses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Swapkit — Swap sales & marketing skills with other small businesses" },
      {
        name: "description",
        content:
          "Trade sales and marketing muscle with small business owners who need what you offer and offer what you need.",
      },
      { property: "og:title", content: "Swapkit — Swap sales & marketing skills" },
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

function Chips({ selected, onToggle, tone }: { selected: string[]; onToggle: (s: string) => void; tone: "give" | "get" }) {
  return (
    <div className="space-y-4">
      {SKILL_GROUPS.map((group) => (
        <div key={group.name}>
          <span className="label">{group.name}</span>
          <div className="flex flex-wrap">
            {group.skills.map((s) => {
              const on = selected.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => onToggle(s)}
                  className={`chip ${on ? (tone === "give" ? "chip-give" : "chip-get") : ""}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Index() {
  const [offers, setOffers] = useState<string[]>(["Copywriting", "Email marketing", "Social media"]);
  const [needs, setNeeds] = useState<string[]>(["SEO", "Paid ads", "LinkedIn outreach"]);
  const [sent, setSent] = useState<string[]>([]);
  const toggle = (set: typeof setOffers) => (s: string) =>
    set((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const matches = useMemo(() => findMatches(offers, needs), [offers, needs]);

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto max-w-6xl px-6 pt-10">
        <span className="font-display text-2xl">Swapkit<span className="text-primary">.</span></span>
        <p className="mt-3 text-sm text-muted-foreground">Sales &amp; marketing swaps for small business owners</p>
        <h1 className="font-display mt-10 max-w-3xl text-5xl leading-[1.05] md:text-7xl">
          Swap sales and marketing muscle with owners who <em className="text-primary">need it</em>.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Pick the sales and marketing skills you can offer and the ones you're short on. We'll find owners
          where the swap works both ways.
        </p>
      </header>

      <section className="mx-auto mt-12 grid max-w-6xl gap-6 px-6 md:grid-cols-2">
        <div className="panel">
          <h2 className="font-display text-2xl">I can offer</h2>
          <p className="mb-5 text-sm text-muted-foreground">Sales or marketing work you could take on</p>
          <Chips selected={offers} onToggle={toggle(setOffers)} tone="give" />
        </div>
        <div className="panel">
          <h2 className="font-display text-2xl">I'm looking for</h2>
          <p className="mb-5 text-sm text-muted-foreground">Sales or marketing help you need right now</p>
          <Chips selected={needs} onToggle={toggle(setNeeds)} tone="get" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="font-display text-3xl">
          {matches.length} mutual {matches.length === 1 ? "match" : "matches"}
        </h2>
        {matches.length === 0 && (
          <p className="mt-4 text-muted-foreground">
            No two-way swaps yet — try adding more sales or marketing skills on either side.
          </p>
        )}
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {matches.map(({ business: b, theyGive, youGive }) => (
            <article key={b.id} className="panel flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl">{b.name}</h3>
                  <p className="text-sm text-muted-foreground">{b.owner} · {b.city}</p>
                </div>
                <span className="avatar">{b.owner.split(" ").map((w) => w[0]).join("")}</span>
              </div>
              <p className="mt-3 text-sm">{b.blurb}</p>
              <p className="mt-2"><span className="chip chip-sm">{b.focus}</span></p>
              <div className="mt-4 space-y-2 text-sm">
                <p><span className="label">They give you</span> {theyGive.map((s) => <span key={s} className="chip chip-get chip-sm">{s}</span>)}</p>
                <p><span className="label">You give them</span> {youGive.map((s) => <span key={s} className="chip chip-give chip-sm">{s}</span>)}</p>
              </div>
              <button
                disabled={sent.includes(b.id)}
                onClick={() => setSent((p) => [...p, b.id])}
                className="btn-swap mt-5"
              >
                {sent.includes(b.id) ? "Swap request sent ✓" : "Propose a swap"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
