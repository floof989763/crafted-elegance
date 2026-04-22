import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { CartProvider } from "@/hooks/use-cart";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Woods — Heirloom Wooden Handicraft" },
      { name: "description", content: "Hand-carved trays, decor, furniture and accessories from a small atelier of wood artisans." },
      { name: "author", content: "The Woods" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "The Woods" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "The Woods — Heirloom Wooden Handicraft" },
      { name: "twitter:title", content: "The Woods — Heirloom Wooden Handicraft" },
      { property: "og:description", content: "Hand-carved trays, decor, furniture and accessories from a small atelier of wood artisans." },
      { name: "twitter:description", content: "Hand-carved trays, decor, furniture and accessories from a small atelier of wood artisans." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d1226b18-59c4-4794-af27-397f102d2a80/id-preview-1cf236ea--3aa30a62-81f4-4d5c-b75b-9adb5f45cece.lovable.app-1776681156587.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d1226b18-59c4-4794-af27-397f102d2a80/id-preview-1cf236ea--3aa30a62-81f4-4d5c-b75b-9adb5f45cece.lovable.app-1776681156587.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  );
}
