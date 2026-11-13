import { Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const POINTS = [
  { title: "What we use", text: "Your business profile, the skills you offer and need, and basic sales figures you choose to connect. We use them only to suggest partners and draft campaigns." },
  { title: "What partners see", text: "Partners see your public profile and the campaign you both agree on. Your customer lists and sales data are never shared with them." },
  { title: "You stay in control", text: "Nothing AI-drafted goes out until both owners approve it, and you can edit every word first." },
  { title: "Never sold", text: "Your data is never sold or passed to third parties. We follow UK GDPR, and you can delete your account and data at any time." },
];

export function DataNotice() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      <Lock className="size-4 shrink-0 text-secondary" />
      <span>Your customer data is never shared with partners. It's only used to suggest matches.</span>
      <Dialog>
        <DialogTrigger className="font-semibold text-foreground underline underline-offset-4">How we use data</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy &amp; data</DialogTitle>
            <DialogDescription>In plain English: what Bond uses, and what it never does.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-4">
            {POINTS.map((p) => (
              <li key={p.title}>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
