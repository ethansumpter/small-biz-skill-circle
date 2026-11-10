import { createFileRoute, Link } from '@tanstack/react-router';
import { Handshake, ArrowUpRight } from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import { BUSINESSES, matchForBusiness } from '@/lib/businesses';
import { useSwapkit } from '@/components/swapkit-state';
import { Button } from '@/components/ui/button';
import { JointCampaign } from '@/components/joint-campaign';

export const Route = createFileRoute('/cooperation')({
  head: () => pageHead('Cooperation', 'Keep track of your sales and marketing skill swap collaborations.'),
  component: Cooperation,
});

function Cooperation() {
  const { cooperations, setCooperations, offers, needs } = useSwapkit();

  return (
    <>
      <div className="page-heading">
        <span className="label">Turn a match into momentum</span>
        <h1>Cooperation</h1>
        <p>Shared work. Shared wins.</p>
      </div>
      {!cooperations.length ? (
        <div className="empty-state">
          <Handshake className="mx-auto mb-4 size-8 text-secondary" />
          <h2 className="font-display text-xl">Your next collaboration starts here</h2>
          <p className="my-3 text-sm text-muted-foreground">Create a cooperation from a partner conversation.</p>
          <Button asChild>
            <Link to="/messages">
              Go to messages
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {cooperations.map((c) => {
            const business = BUSINESSES.find((b) => b.id === c.businessId);
            const match = matchForBusiness(c.businessId, offers, needs);
            return (
              <article className="cooperation-row" key={c.businessId}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="preview-badge">{c.completed ? 'Completed' : 'In progress'} · Preview</span>
                    <h2 className="mt-3 font-display text-xl">{c.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{business?.name}</p>
                  </div>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={c.completed}
                      onChange={(e) =>
                        setCooperations((items) =>
                          items.map((item) => (item.businessId === c.businessId ? { ...item, completed: e.target.checked } : item)),
                        )
                      }
                    />
                    Mark complete
                  </label>
                </div>
                {match && (
                  <section className="mt-5 border-t border-border pt-5">
                    <h3 className="font-display text-lg">Joint campaigns</h3>
                    <div className="mt-3">
                      <JointCampaign match={match} />
                    </div>
                  </section>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
