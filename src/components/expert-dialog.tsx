import { useState } from "react";
import { Check, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** Example experts for the pitch preview. No real booking is made. */
const EXPERTS = [
  { initials: "HO", name: "Hannah Okafor", specialism: "Partnerships & co-marketing", note: "Plans joint campaigns across several local businesses." },
  { initials: "DL", name: "Daniel Lee", specialism: "Paid ads", note: "Turns a working collab into a paid campaign that scales." },
  { initials: "SR", name: "Sofia Rossi", specialism: "Content strategy", note: "Builds a content plan both partners can share." },
];

export function ExpertDialog() {
  const [booked, setBooked] = useState<string[]>([]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><GraduationCap />Ask an expert</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Need help with a bigger campaign?</DialogTitle>
          <DialogDescription>
            Book a call with a fractional sales and marketing expert from Awesome Molecules. They work part-time with your business, so you get specialist help without hiring.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {EXPERTS.map((e) => {
            const done = booked.includes(e.name);
            return (
              <li key={e.name} className="flex items-center gap-3 rounded-md border border-border p-3">
                <span className="avatar">{e.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{e.name}</p>
                  <p className="text-xs text-secondary">{e.specialism}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{e.note}</p>
                </div>
                <Button size="sm" variant={done ? "secondary" : "default"} disabled={done} onClick={() => setBooked((b) => [...b, e.name])}>
                  {done ? <><Check />Requested</> : "Book a call"}
                </Button>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted-foreground">Preview only: no booking is sent.</p>
      </DialogContent>
    </Dialog>
  );
}
