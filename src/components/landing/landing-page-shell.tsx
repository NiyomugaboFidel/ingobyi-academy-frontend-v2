import type { ReactNode } from 'react';
import { ExploreNav } from '@/components/layout/explore-nav';
import { LandingFooter } from '@/components/landing/landing-footer';

type LandingPageShellProps = {
  children: ReactNode;
  showCatalogQuickNav?: boolean;
  footerVariant?: 'light' | 'dark';
};

export function LandingPageShell({
  children,
  showCatalogQuickNav = false,
  footerVariant = 'light',
}: LandingPageShellProps) {
  return (
    <div className="min-h-screen bg-white font-poppins antialiased">
      <ExploreNav showCatalogQuickNav={showCatalogQuickNav} />
      <main id="main">{children}</main>
      <LandingFooter variant={footerVariant} />
    </div>
  );
}
