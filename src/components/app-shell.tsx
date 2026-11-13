import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Compass, HeartHandshake, Users, MessageSquare, Handshake, CreditCard, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { type ReactNode } from "react";
import { useBond } from "./bond-state";

const navigation = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/discover", label: "Discover partner", icon: Compass },
  { to: "/matches", label: "My matches", icon: HeartHandshake },
  { to: "/profiles", label: "Profiles", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/cooperation", label: "Cooperation", icon: Handshake },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { profile } = useBond();
  return <div className="app-layout">
    <aside className="app-sidebar">
      <Link to="/" className="brand"><ArrowLeftRight className="size-6 text-primary" />Bond<span className="text-primary">.</span></Link>
      <p className="sidebar-caption">A little give. A lot of growth.</p>
      <nav aria-label="Main navigation" className="app-nav">{navigation.map(({ to, label, icon: Icon }) => <Link key={to} to={to} activeOptions={{ exact: true }} activeProps={{ className: "nav-item nav-active" }} inactiveProps={{ className: "nav-item" }}><Icon className="size-[18px]" /><span>{label}</span></Link>)}</nav>
      <div className="sidebar-bottom"><span className="label">Your circle, your potential</span><Link to="/discover" className="flex items-center justify-between text-sm font-semibold">Find your next partner<ArrowUpRight className="size-4" /></Link></div>
      <Link to="/profiles" className="sidebar-profile"><span className="avatar">AM</span><span><strong className="block text-sm">{profile.owner}</strong><span className="text-xs text-muted-foreground">{profile.name}</span></span></Link>
    </aside>
    <div className="min-w-0"><header className="app-topbar"><span className="text-sm text-muted-foreground">Sales &amp; marketing circle</span><span className="preview-badge">Preview · example members</span></header><main className="app-content">{children}</main></div>
  </div>;
}