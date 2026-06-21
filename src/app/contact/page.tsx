'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LandingPageShell } from '@/components/landing/landing-page-shell';
import { LandingHero } from '@/components/landing/landing-hero';
import { Mail, Phone, MapPin, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <LandingPageShell>
      <LandingHero
        variant="image"
        imageSrc="/blog-1/ingobyi-first-6.jpg"
        eyebrow="Get in touch"
        title="Contact Core Group & Ingobyi"
        description="Partnerships, donations, school labs, or Ingobyi Academy support — our team in Kigali is ready to help."
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <h2 className="text-xl font-extrabold text-brand-ink">Visit & connect</h2>
              <p className="mt-2 text-sm text-brand-ink/65">
                Our team is based in Kigali and works with schools across Rwanda.
              </p>

              <ul className="mt-6 space-y-4">
                {[
                  {
                    Icon: Mail,
                    label: 'Email',
                    content: (
                      <a href="mailto:coregroup.rwanda@gmail.com" className="font-medium text-brand-green hover:underline">
                        coregroup.rwanda@gmail.com
                      </a>
                    ),
                  },
                  {
                    Icon: Phone,
                    label: 'Phone',
                    content: (
                      <div className="space-y-0.5">
                        <a href="tel:+250798366977" className="block font-medium text-brand-ink hover:text-brand-green">
                          +250 798 366 977
                        </a>
                        <a href="tel:+250783732286" className="block font-medium text-brand-ink hover:text-brand-green">
                          +250 783 732 286
                        </a>
                      </div>
                    ),
                  },
                  {
                    Icon: MapPin,
                    label: 'Address',
                    content: (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        26G9+6H9, Kabuga–Gasabo, Rwanda
                        <br />
                        Light Center Kabuga, Kigali
                      </p>
                    ),
                  },
                ].map(({ Icon, label, content }) => (
                  <li
                    key={label}
                    className="flex gap-4 rounded-2xl border border-brand-green/8 bg-brand-mint-wash/70 p-4 shadow-sm"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-ink">{label}</p>
                      <div className="mt-1">{content}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 overflow-hidden rounded-2xl border border-brand-green/10 shadow-sm">
                <img
                  src="/blog-1/ingobyi-first-1.jpg"
                  alt="Ingobyi Innovation Hub"
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Connect with Core Group
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { href: 'https://x.com/coregroup', label: 'X / Twitter' },
                    { href: 'https://www.linkedin.com/in/coregroup-rwanda-4199693b8/', label: 'LinkedIn' },
                    { href: 'https://www.instagram.com/coregroup.rwanda/', label: 'Instagram' },
                    { href: 'https://www.tiktok.com/@coregroup', label: 'TikTok' },
                    { href: 'https://www.youtube.com/@coregroup.rwanda', label: 'YouTube' },
                  ].map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/15 bg-white px-4 py-1.5 text-xs font-semibold text-brand-ink transition hover:border-brand-green/40 hover:bg-brand-green/5"
                    >
                      {s.label}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-green/10 bg-white p-8 shadow-md">
              {sent ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-mint/30">
                    <Check className="h-7 w-7 text-brand-green" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-brand-green">Message sent!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thank you. We received your message and will get back to you soon.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-extrabold text-brand-ink">Send a message</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Share your role and what you&apos;re hoping to achieve — we&apos;ll route it to the right person.
                  </p>
                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-brand-ink">Your name</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-lg border border-brand-green/15 bg-brand-mint-wash/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-brand-ink">Email</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-lg border border-brand-green/15 bg-brand-mint-wash/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-brand-ink">
                        Your role (school, parent, donor…)
                      </label>
                      <input
                        value={form.role}
                        onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                        className="w-full rounded-lg border border-brand-green/15 bg-brand-mint-wash/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-brand-ink">Message</label>
                      <textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        className="w-full resize-none rounded-lg border border-brand-green/15 bg-brand-mint-wash/30 px-4 py-2.5 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">
                      Send message
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">
              <a href="mailto:coregroup.rwanda@gmail.com">Email us</a>
            </Button>
            <Button asChild variant="outline" className="rounded-full font-bold">
              <Link href="/partners">Partner or donate</Link>
            </Button>
          </div>
        </div>
      </section>
    </LandingPageShell>
  );
}
