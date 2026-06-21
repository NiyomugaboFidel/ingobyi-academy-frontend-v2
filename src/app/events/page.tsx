import Link from 'next/link';
import { LandingPageShell } from '@/components/landing/landing-page-shell';
import { LandingHero } from '@/components/landing/landing-hero';
import { Calendar, MapPin, Users } from 'lucide-react';

const EVENTS = [
  { id: '1', title: 'Ingobyi STEM Bootcamp — July 2026', date: 'Jul 7–11, 2026', location: 'Ingobyi Innovation Hub, Kigali', spots: '30 spots', category: 'Bootcamp', image: '/blog-1/ingobyi-first-1.jpg' },
  { id: '2', title: 'Robotics Competition — August 2026', date: 'Aug 15, 2026', location: 'Kigali Convention Centre', spots: '50 teams', category: 'Competition', image: '/blog-1/ingobyi-first-2.jpg' },
  { id: '3', title: 'Parent Open Day — July 2026', date: 'Jul 26, 2026', location: 'Ingobyi Innovation Hub, Kigali', spots: 'Open', category: 'Open Day', image: '/blog-1/ingobyi-first-3.jpg' },
  { id: '4', title: 'Coding Workshop for Beginners', date: 'Every Saturday', location: 'Online (Ingobyi Academy)', spots: 'Unlimited', category: 'Workshop', image: '/blog-1/ingobyi-first-4.jpg' },
];

export default function EventsPage() {
  return (
    <LandingPageShell>
      <LandingHero
        variant="brand"
        eyebrow="Ingobyi Innovation Hub"
        title="Events & bootcamps"
        description="Live workshops, competitions, and bootcamps at Ingobyi Innovation Hub and partner venues across Rwanda."
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {EVENTS.map((ev) => (
              <article
                key={ev.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-brand-green/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-green/20 hover:shadow-md"
              >
                <div className="aspect-[16/10] overflow-hidden bg-brand-mint-wash">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="inline-flex w-fit rounded-full bg-brand-green/8 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-green">
                    {ev.category}
                  </span>
                  <h2 className="mt-2 text-sm font-bold leading-snug text-brand-ink">{ev.title}</h2>
                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                      {ev.date}
                    </p>
                    <p className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" />
                      {ev.location}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                      {ev.spots}
                    </p>
                  </div>
                  <div className="mt-auto pt-4">
                    <Link
                      href="/contact"
                      className="block w-full rounded-full bg-brand-green py-2.5 text-center text-xs font-bold text-white transition hover:bg-brand-green-dark"
                    >
                      Register interest
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </LandingPageShell>
  );
}
