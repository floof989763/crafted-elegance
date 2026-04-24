import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Package, Tag, MessageSquare, LogOut, Loader2, FileText, Layers } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — The Woods" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/content", label: "Site content", icon: Layers },
  { to: "/admin/pages", label: "Custom pages", icon: FileText },
  { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
];

function AdminLayout() {
  const { loading, user, isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/admin/login" });
    }
  }, [loading, user, navigate]);

  // Allow login route to render even when unauthenticated
  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-brass" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <p className="eyebrow">Restricted</p>
          <h1 className="mt-4 font-display text-4xl text-ink">Not an admin.</h1>
          <p className="mt-4 text-muted-foreground text-sm">
            Your account exists but no admin role has been assigned. Ask the owner to
            grant you the admin role in <code className="text-brass">user_roles</code>.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login" });
            }}
            className="mt-8 text-xs uppercase tracking-[0.28em] text-brass luxe-link"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <Link to="/" className="px-6 py-8 font-display text-2xl text-ink border-b border-border">
          The Woods<span className="text-brass">.</span>
          <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground mt-1">
            Atelier panel
          </div>
        </Link>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              className="flex items-center gap-3 px-4 py-3 text-sm rounded-sm text-ink/70 hover:bg-walnut hover:text-ink transition-colors"
              activeProps={{ className: "bg-walnut text-brass" }}
            >
              <l.icon className="w-4 h-4" strokeWidth={1.4} />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground truncate px-2">{user.email}</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login" });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-sm text-ink/70 hover:bg-walnut hover:text-ink transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.4} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
