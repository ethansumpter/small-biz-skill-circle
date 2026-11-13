import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Loader2, Repeat, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canLaunch, draftCampaign, exampleResults, resultsSuggestion, type CampaignDraft } from "@/lib/campaign";
import { type Match } from "@/lib/businesses";
import { useBond } from "./bond-state";

type Stage = "idle" | "drafting" | "ready";

export function JointCampaign({ match }: { match: Match }) {
  const { profile } = useBond();
  const partner = match.business;
  const [stage, setStage] = useState<Stage>("idle");
  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const [mine, setMine] = useState(false);
  const [theirs, setTheirs] = useState(false);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (stage !== "drafting") return;
    const t = setTimeout(() => {
      setDraft(draftCampaign({ name: profile.name, skills: match.youGive }, { name: partner.name, skills: match.theyGive }));
      setStage("ready");
    }, 1800);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "ready" || theirs) return;
    const t = setTimeout(() => setTheirs(true), 4000);
    return () => clearTimeout(t);
  }, [stage, theirs]);

  const field = (key: keyof CampaignDraft, label: string, rows = 1) => (
    <label className="block">
      <span className="label">{label}</span>
      {rows > 1
        ? <textarea className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm" rows={rows} value={draft![key]} onChange={(e) => setDraft({ ...draft!, [key]: e.target.value })} />
        : <input className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm" value={draft![key]} onChange={(e) => setDraft({ ...draft!, [key]: e.target.value })} />}
    </label>
  );

  const owner = (name: string, biz: string, approved: boolean, onApprove?: () => void) => (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
      <div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">{biz}</p></div>
      <Button size="sm" variant={approved ? "secondary" : "default"} disabled={approved || !onApprove} onClick={onApprove}>{approved ? <><Check />Approved</> : "Approve"}</Button>
    </div>
  );

  return (
    <article className="cooperation-row block">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><span className="preview-badge">Matched partnership · Preview</span><h2 className="mt-3 font-display text-xl">{partner.name}</h2><p className="text-sm text-muted-foreground">{match.theyGive.join(", ")} ⇄ {match.youGive.join(", ")}</p></div>
        {stage === "idle" && <Button onClick={() => setStage("drafting")}><Sparkles />Create joint campaign</Button>}
      </div>
      {stage === "drafting" && <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />AI is drafting your campaign...</p>}
      {stage === "ready" && draft && (
        <div className="mt-5 space-y-4">
          {field("name", "Campaign name", 2)}
          {field("post", "Co-branded social post", 4)}
          {field("email", "Promotional email", 8)}
          {field("offer", "Joint offer", 2)}
          {field("code", "Discount code")}
          <div className="grid gap-3 sm:grid-cols-2">
            {owner(profile.owner, profile.name, mine, () => setMine(true))}
            {owner(partner.owner, partner.name, theirs)}
          </div>
          {launched ? <LaunchedResults code={draft.code} me={profile.name} partner={partner.name} onRepeat={() => { setStage("idle"); setDraft(null); setMine(false); setTheirs(false); setLaunched(false); }} />
            : canLaunch(mine, theirs) ? <Button onClick={() => setLaunched(true)}><Rocket />Launch campaign</Button>
            : <p className="text-sm text-muted-foreground">{!theirs ? "Waiting for partner approval" : "Waiting for your approval"}</p>}
        </div>
      )}
    </article>
  );
}

function LaunchedResults({ code, me, partner, onRepeat }: { code: string; me: string; partner: string; onRepeat: () => void }) {
  const r = exampleResults();
  const max = Math.max(r.mine, r.theirs, 1);
  const bar = (name: string, value: number) => (
    <div>
      <div className="flex justify-between text-xs"><span>{name}</span><strong>{value} new customers</strong></div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary" style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Rocket className="size-4" />Campaign launched (preview)</p>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-secondary" />AI-drafted, approved by both owners</p>
      <div className="rounded-md border border-border bg-card p-4">
        <span className="label">Results so far · example data</span>
        <div className="mt-2 grid grid-cols-3 gap-3 border-b border-border pb-4">
          <div><p className="text-xs text-muted-foreground">Discount code</p><p className="font-semibold">{code}</p></div>
          <div><p className="text-xs text-muted-foreground">Times used</p><p className="font-display text-2xl">{r.uses}</p></div>
          <div><p className="text-xs text-muted-foreground">New customers</p><p className="font-display text-2xl">{r.mine + r.theirs}</p></div>
        </div>
        <div className="mt-4 space-y-3">{bar(me, r.mine)}{bar(partner, r.theirs)}</div>
        <p className="mt-4 flex items-start gap-2 text-sm"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />{resultsSuggestion(r)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={onRepeat}><Repeat />Repeat collab</Button>
          <Button size="sm" variant="outline" asChild><Link to="/discover">Find a new partner</Link></Button>
        </div>
      </div>
    </div>
  );
}
