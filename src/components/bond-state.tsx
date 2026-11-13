import { createContext, useContext, useState, type ReactNode } from "react";
import { findMatches } from "@/lib/businesses";

export type PreviewMessage = { id: string; businessId: string; text: string; mine: boolean };
export type Cooperation = { businessId: string; title: string; completed: boolean };

function usePreviewState() {
  const [profile, setProfile] = useState({ name: "Morgan Growth Studio", owner: "Alex Morgan", city: "London", blurb: "Content and email marketing for growing small businesses." });
  const [offers, setOffers] = useState<string[]>(["Copywriting", "Email marketing", "Social media"]);
  const [needs, setNeeds] = useState<string[]>(["SEO", "Paid ads", "LinkedIn outreach"]);
  const [saved, setSaved] = useState<string[]>([]);
  const [proposed, setProposed] = useState<string[]>(["1"]);
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  // Demo always opens with one example cooperation so the page is never empty.
  const [cooperations, setCooperations] = useState<Cooperation[]>([
    { businessId: "1", title: "Morgan Growth Studio × Northline Sales Co.", completed: false },
  ]);
  const matches = findMatches(offers, needs);
  const toggleSaved = (id: string) => setSaved((previous) => previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id]);
  const sendMessage = (businessId: string, text: string) => {
    if (!text.trim()) return;
    setMessages((previous) => [...previous, { id: crypto.randomUUID(), businessId, text: text.trim(), mine: true }]);
  };
  const propose = (id: string) => {
    if (proposed.includes(id)) return;
    setProposed((previous) => [...previous, id]);
    sendMessage(id, "I'd love to explore a sales and marketing skill swap. Shall we discuss what we can each offer?");
  };
  const startCooperation = (id: string, title: string) => {
    if (cooperations.some((item) => item.businessId === id)) return;
    setCooperations((previous) => [...previous, { businessId: id, title, completed: false }]);
  };
  return { profile, setProfile, offers, setOffers, needs, setNeeds, saved, toggleSaved, proposed, propose, messages, sendMessage, cooperations, setCooperations, startCooperation, matches };
}

type PreviewState = ReturnType<typeof usePreviewState>;
const PreviewContext = createContext<PreviewState | null>(null);
export function BondProvider({ children }: { children: ReactNode }) {
  const state = usePreviewState();
  return <PreviewContext.Provider value={state}>{children}</PreviewContext.Provider>;
}
export function useBond() {
  const state = useContext(PreviewContext);
  if (!state) throw new Error("BondProvider is required");
  return state;
}