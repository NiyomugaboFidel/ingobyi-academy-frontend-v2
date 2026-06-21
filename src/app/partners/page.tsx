import Link from 'next/link';
import { LandingPageShell } from '@/components/landing/landing-page-shell';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingSectionHeader } from '@/components/landing/landing-section-header';
import { LandingCtaBand } from '@/components/landing/landing-cta-band';
import { Button } from '@/components/ui/button';
import { Check, Heart, Building2, Globe2 } from 'lucide-react';

const PARTNER_LOGOS = [
  { name: "LE PLAISIR D'ENFANT", logo: '/partener/school-1.jpg' },
  { name: 'CodeBridge', logo: '/partener/codebridge.jpg' },
  { name: 'Value Ed', logo: '/partener/value-ed.jpeg' },
  { name: 'Ingobyi Innovation Hub', logo: '/partener/ingobyi.png' },
  { name: 'Core Group Ltd', logo: '/logos/coregroup.png' },
];

export default function PartnersPage() {
  return (
    <LandingPageShell>
      <LandingHero
        variant="image"
        imageSrc="/blog-2/school-2.jpeg"
        eyebrow="Partnership"
        title="Partner with Ingobyi"
        description="Join schools, companies, and donors helping bring quality hands-on education to Rwandan learners — online, in schools, and at the Innovation Hub."
        actions={
          <Button asChild className="rounded-full bg-brand-mint font-bold text-brand-green-darker hover:bg-brand-mint-hover">
            <Link href="/contact">Get in touch</Link>
          </Button>
        }
      />

      <section className="border-b border-brand-green/8 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeader title="Ways to partner" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                Icon: Building2, title: 'School Partnership',
                desc: 'Integrate Ingobyi programs into your school — after-school clubs, in-class STEM activities, and teacher training.',
                benefits: ['On-site instructor support', 'Curriculum materials', 'Progress reporting for parents', 'Certified student achievements'],
              },
              {
                Icon: Globe2, title: 'Corporate Sponsorship',
                desc: 'Sponsor student cohorts, equipment, or entire programs. Get brand recognition and impact reports.',
                benefits: ['Named sponsorship recognition', 'Impact reports & data', 'Employee volunteering opportunities', 'CSR documentation'],
              },
              {
                Icon: Heart, title: 'Individual Donor',
                desc: "Support a student's learning journey through a direct donation. Every contribution funds hands-on kits and mentor time.",
                benefits: ['Tax-deductible receipts', 'Student progress updates', 'Impact storytelling', 'Community recognition'],
              },
            ].map(({ Icon, title, desc, benefits }) => (
              <div key={title} className="flex flex-col rounded-2xl border border-brand-green/10 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/8 text-brand-green">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-brand-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <ul className="mt-5 space-y-2">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-brand-ink">
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Button asChild className="w-full rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">
                    <Link href="/contact">Learn more</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-mint-wash py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeader
            title="Our partners"
            description="Schools and organizations working with us to reach Rwandan learners."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {PARTNER_LOGOS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center justify-center rounded-2xl border border-brand-green/8 bg-white p-6 shadow-sm"
              >
                <div className="flex h-16 w-full items-center justify-center">
                  <img src={p.logo} alt={p.name} className="max-h-14 max-w-full object-contain" loading="lazy" />
                </div>
                <p className="mt-3 text-center text-xs font-semibold text-brand-ink/80">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingCtaBand
        title="Ready to collaborate?"
        description="Tell us about your school, company, or community — we'll design a partnership that fits your goals."
        actions={
          <Button asChild className="rounded-full bg-brand-mint font-bold text-brand-green-darker hover:bg-brand-mint-hover">
            <Link href="/contact">Start a conversation</Link>
          </Button>
        }
      />
    </LandingPageShell>
  );
}
