import { createFileRoute } from '@tanstack/react-router';
import { Check, CreditCard } from 'lucide-react';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/subscription')({ head: () => pageHead('Subscription', 'Your Bond membership for sales and marketing partnerships.'), component: Subscription });
function Subscription() {
 return <><div className="page-heading"><span className="label">Invest in your circle</span><h1>Subscription</h1><p>A place for your business to grow together.</p></div><section className="subscription-band"><div><CreditCard className="mb-5 size-8 text-secondary" /><span className="preview-badge">Current access</span><h2 className="mt-4 font-display text-3xl">Preview membership</h2><p className="mt-3 max-w-md text-sm text-muted-foreground">No active subscription. Pricing and paid memberships have not been set up.</p></div><ul className="space-y-4 text-sm">{['Sales & marketing partner discovery', 'Mutual matches and saved partners', 'Business profile', 'Preview conversations and cooperation'].map((s) => <li key={s} className="flex items-center gap-3"><Check className="size-4 text-secondary" />{s}</li>)}</ul></section><div className="mt-10 border-t pt-7"><h2 className="section-title">Billing history</h2><p className="text-sm text-muted-foreground">No payments or invoices.</p></div></>;
}
