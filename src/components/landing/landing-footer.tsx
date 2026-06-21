import Link from 'next/link';
import { Globe2, Mail, MapPin, Phone, Share2 } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { cn } from '@/lib/utils';

type Props = { variant?: 'light' | 'dark' };

const aboutLinks = [
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/partners', label: 'Partners' },
  { href: '/events', label: 'Events' },
  { href: '/blog', label: 'Blog' },
];
const learnerLinks = [
  { href: '/search', label: 'Browse courses' },
  { href: '/login?mode=signup', label: 'Sign up' },
  { href: '/login', label: 'Sign in' },
  { href: '/contact', label: 'Contact' },
];
const trainerLinks = [
  { href: '/login?mode=signup', label: 'Become a trainer' },
  { href: '/programs', label: 'Programs we run' },
  { href: '/contact', label: 'Partner with us' },
];
const legalLinks = [
  { href: '/contact', label: 'Cookies policy' },
  { href: '/contact', label: 'Accessibility' },
  { href: '/contact', label: 'Privacy policy' },
  { href: '/contact', label: 'Terms of service' },
];

export function LandingFooter({ variant = 'light' }: Props) {
  const dark = variant === 'dark';
  const year = new Date().getFullYear();

  const headingClass = cn(
    'mb-3 text-xs font-extrabold uppercase tracking-wide',
    dark ? 'text-brand-mint' : 'text-brand-green',
  );
  const linkClass = cn(
    'block text-xs transition-colors',
    dark ? 'text-white/75 hover:text-brand-mint' : 'text-brand-ink/80 hover:text-brand-green',
  );

  return (
    <footer
      className={cn(
        'border-t font-poppins text-[13px] leading-relaxed sm:text-sm',
        dark
          ? 'border-white/10 bg-brand-green-footer text-white'
          : 'border-brand-green/10 bg-brand-page-bg text-brand-ink',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <BrandLogo size="md" />
            <p
              className={cn(
                'mt-3 max-w-xs text-xs leading-relaxed',
                dark ? 'text-white/70' : 'text-brand-ink/75',
              )}
            >
              Connecting Rwandan learners to industry-grade skills through online and in-person
              programs.
            </p>
            <ul className={cn('mt-5 space-y-2 text-xs', dark ? 'text-white/75' : 'text-brand-ink/80')}>
              <li className="flex items-center gap-2">
                <Mail
                  className={cn('h-3.5 w-3.5 shrink-0', dark ? 'text-brand-mint' : 'text-brand-green')}
                />
                <a
                  href="mailto:hello@ingobyi.academy"
                  className={cn(
                    'underline-offset-2 hover:underline',
                    dark ? 'hover:text-brand-mint' : 'hover:text-brand-green',
                  )}
                >
                  hello@ingobyi.academy
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone
                  className={cn('h-3.5 w-3.5 shrink-0', dark ? 'text-brand-mint' : 'text-brand-green')}
                />
                <a href="tel:+250795454671">+250 79 545 4671</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0',
                    dark ? 'text-brand-mint' : 'text-brand-green',
                  )}
                />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Share2, label: 'Facebook', href: 'https://facebook.com' },
                { Icon: Share2, label: 'Twitter', href: 'https://twitter.com' },
                { Icon: Share2, label: 'Instagram', href: 'https://instagram.com' },
                { Icon: Share2, label: 'LinkedIn', href: 'https://linkedin.com' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={dark ? 'text-white/55 hover:text-brand-mint' : 'text-brand-ink/55 hover:text-brand-green'}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={headingClass}>About</h3>
            <ul className="space-y-1.5">
              {aboutLinks.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>For learners</h3>
            <ul className="space-y-1.5">
              {learnerLinks.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>For trainers</h3>
            <ul className="space-y-1.5">
              {trainerLinks.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className={cn(headingClass, 'mt-6')}>Legal</h3>
            <ul className="space-y-1.5">
              {legalLinks.map((l, i) => (
                <li key={l.label + i}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Newsletter</h3>
            <p className={cn('mb-3 text-xs', dark ? 'text-white/65' : 'text-brand-ink/75')}>
              Get learning tips and news from Rwanda&apos;s tech hub.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className={cn(
                  'h-9 rounded-md border px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/30',
                  dark
                    ? 'border-white/15 bg-white/10 text-white placeholder:text-white/40'
                    : 'border-brand-green/15 bg-white text-brand-ink',
                )}
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="rounded-md bg-brand-yellow px-4 py-2 text-xs font-extrabold text-brand-green hover:bg-brand-yellow/90"
              >
                Subscribe
              </button>
            </form>
            <div className="mt-5">
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded border px-3 py-2 text-xs font-bold',
                  dark
                    ? 'border-white/15 text-white/85 hover:bg-white/5'
                    : 'border-brand-green/20 text-brand-green hover:bg-brand-green/5',
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5" /> English
                </span>
                <span>›</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'mt-10 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between',
            dark ? 'border-white/10 text-white/55' : 'border-brand-green/10 text-brand-ink/55',
          )}
        >
          <span className="text-xs">© {year} Ingobyi Academy</span>
          <span className="text-[10px] sm:text-xs">
            Built with care in Kigali — connecting Rwandan learners to industry-grade skills.
          </span>
        </div>
      </div>
    </footer>
  );
}
