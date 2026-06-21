import Link from 'next/link';
import { LandingPageShell } from '@/components/landing/landing-page-shell';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingSectionHeader } from '@/components/landing/landing-section-header';
import { LandingCtaBand } from '@/components/landing/landing-cta-band';
import { Button } from '@/components/ui/button';
import { Check, Globe2, School, Users } from 'lucide-react';

const TEAM = [
  { name: 'Tumukunde Victoria', role: 'Operations Manager', image: '/tumukunde.jpeg' },
  { name: 'Aisha Khaitou koita', role: 'Project Manager', image: '/aisha.jpeg' },
  { name: 'Mano Victoria', role: 'Mathematics & Physics Educator', image: '/mano.jpeg' },
  { name: 'Ishimwe Jesus Dollar', role: 'Soft Skills Trainer', image: '/dollar.jpeg' },
  { name: 'Imanirankunda Plaisir', role: 'UI/UX Designer', image: '/plassire.jpeg' },
  { name: 'Ndatimana Edison', role: 'Video Editor & Multimedia', image: '/ndatimana.jpeg' },
  { name: 'Olivier Dusenge', role: 'Marketing & Communications', image: '/dusenge.jpeg' },
  { name: 'Albert Izina', role: 'Robotics & Embedded Systems', image: '/albert.jpeg' },
];

export default function AboutPage() {
  return (
    <LandingPageShell>
      <LandingHero
        variant="image"
        imageSrc="/blog-1/ingobyi-first-8.jpg"
        eyebrow="Core Group Ltd"
        title="About Ingobyi Academy"
        description="Core Group Ltd is a Rwandan technology and innovation company. Through Ingobyi Innovation Hub, Ingobyi Academy, and school innovation clubs, we help learners build real skills with mentors, local kits, and structured online courses."
        actions={
          <>
            <Button asChild className="rounded-full bg-brand-mint font-bold text-brand-green-darker hover:bg-brand-mint-hover">
              <Link href="/programs">Our programs</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/35 bg-white/10 font-bold text-white hover:bg-white/15">
              <Link href="/contact">Contact us</Link>
            </Button>
          </>
        }
      />

      <section className="border-b border-brand-green/8 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <LandingSectionHeader
                align="left"
                eyebrow="Our mission"
                title="What we do in schools"
                description="Ingobyi Innovation Hub works with schools to support teachers in integrating hands-on STEM activities and after-school workshops for children."
              />
              <ul className="mt-6 space-y-3">
                {[
                  'Curriculum mapped to Rwandan education standards',
                  'Locally made kits and teaching resources',
                  'Trained instructors in 12+ partner schools',
                  'Online courses for self-paced learning',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-mint/40 text-brand-green">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm text-brand-ink">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['/blog-1/ingobyi-first-1.jpg', '/blog-1/ingobyi-first-2.jpg', '/blog-1/ingobyi-first-3.jpg', '/blog-1/ingobyi-first-4.jpg'].map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-2xl border border-brand-green/10 shadow-sm">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-green/8 bg-brand-mint-wash py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeader
            title="Our three pillars"
            description="The three ways Core Group Ltd reaches learners across Rwanda."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { Icon: Globe2, title: 'Ingobyi Academy', desc: 'Online courses for STEM, creative arts, sports and life skills — accessible to every learner with internet access.' },
              { Icon: School, title: 'Innovation Hub', desc: 'Physical bootcamps, maker-space sessions and competitions at our hub in Kigali for hands-on learning.' },
              { Icon: Users, title: 'Innovation Clubs', desc: 'After-school clubs in partner schools that bring structured activities directly to children in their communities.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-brand-green/10 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/8 text-brand-green">
                  <item.Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brand-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/65">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-brand-green/8 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeader
            title="Meet the team"
            description="Rwandan professionals dedicated to education, technology, and youth development."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div key={member.name} className="flex flex-col items-center rounded-2xl border border-brand-green/8 bg-brand-mint-wash/60 p-6 text-center shadow-sm">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-brand-mint/40 shadow-sm">
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <p className="mt-4 font-bold text-brand-ink">{member.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingCtaBand
        title="Local, accessible STEM education"
        description="Our teaching resources are locally made so technology is designed for Rwanda's education system — accessible and affordable for schools nationwide."
        actions={
          <>
            <Button asChild className="rounded-full bg-brand-mint font-bold text-brand-green-darker hover:bg-brand-mint-hover">
              <Link href="/programs">Explore programs</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/30 bg-transparent font-bold text-white hover:bg-white/10">
              <Link href="/contact">Partner with us</Link>
            </Button>
          </>
        }
      />
    </LandingPageShell>
  );
}
