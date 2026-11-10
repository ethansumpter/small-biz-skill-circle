import { useEffect, useState } from "react";
import { Check, Loader2, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canLaunch, draftCampaign, type CampaignDraft } from "@/lib/campaign";
import { type Match } from "@/lib/businesses";
import { useSwapkit } from "./swapkit-state";

type Stage = "idle" | "drafting" | "ready";

export function JointCampaign({ match }: { match: Match }) {
  const { profile } = useSwapkit();
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
          {field("name", "Campaign name")}
          {field("post", "Co-branded social post", 4)}
          {field("email", "Promotional email", 8)}
          {field("offer", "Joint offer", 2)}
          {field("code", "Discount code")}
          <div className="grid gap-3 sm:grid-cols-2">
            {owner(profile.owner, profile.name, mine, () => setMine(true))}
            {owner(partner.owner, partner.name, theirs)}
          </div>
          {launched ? <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Rocket className="size-4" />Campaign launched (preview)</p>
            : canLaunch(mine, theirs) ? <Button onClick={() => setLaunched(true)}><Rocket />Launch campaign</Button>
            : <p className="text-sm text-muted-foreground">{!theirs ? "Waiting for partner approval" : "Waiting for your approval"}</p>}
        </div>
      )}
    </article>
  );
}
