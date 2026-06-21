'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Play, Sparkles, PenLine, School, Globe2,
  BookOpen, Cpu, ClipboardCheck, BadgeCheck,
  Check, Star, ChevronLeft, ChevronRight,
  Lightbulb, Code2,
} from 'lucide-react';
import { ExploreNav } from '@/components/layout/explore-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Button } from '@/components/ui/button';
import { brand } from '@/lib/brand';

const TEAM = [
  { id: 't1', name: 'Tumukunde Victoria', role: 'Operations Manager', image: '/tumukunde.jpeg' },
  { id: 't2', name: 'Aisha Khaitou koita', role: 'Project Manager', image: '/aisha.jpeg' },
  { id: 't3', name: 'Mano Victoria', role: 'Mathematics & Physics Educator', image: '/mano.jpeg' },
  { id: 't4', name: 'Ishimwe Jesus Dollar', role: 'Soft Skills & Professional Development Trainer', image: '/dollar.jpeg' },
  { id: 't5', name: 'Imanirankunda Plaisir', role: 'UI/UX Designer', image: '/plassire.jpeg' },
  { id: 't6', name: 'Ndatimana Edison', role: 'Video Editor & Multimedia Specialist', image: '/ndatimana.jpeg' },
];

const TESTIMONIALS = [
  { name: 'Amina K.', role: 'Student, Kigali', text: 'Ingobyi Academy helped me go from zero to building my first robot in just 6 weeks. The mentors are incredible.' },
  { name: 'Jean-Pierre M.', role: 'Parent, Gasabo', text: 'My daughter joined the coding program and now builds apps on weekends. The hands-on approach is exactly what she needed.' },
  { name: 'Mrs Uwera', role: 'Teacher, LE PLAISIR', text: 'The school partnership has transformed how our students interact with technology. Children are so engaged and curious now.' },
];

const BLOG_POSTS = [
  {
    slug: 'stem-and-schools-in-rwanda',
    title: 'First holiday bootcamp at Ingobyi Innovation Hub',
    date: '2026-04-18',
    excerpt: 'Our first bootcamp welcomed twenty students for hands-on holiday training in STEM — building, coding, and confidence together.',
    coverImage: '/blog-1/ingobyi-first-1.jpg',
    coverImageAlt: 'Ingobyi Innovation Hub — holiday STEM bootcamp',
  },
  {
    slug: 'building-products-with-partners',
    title: "Robotics and embedded systems at LE PLAISIR D'ENFANT",
    date: '2026-04-25',
    excerpt: "Starting young with robotics at LE PLAISIR D'ENFANT — a bilingual active school in Gasabo, Rwanda.",
    coverImage: '/blog-2/school-1.jpeg',
    coverImageAlt: "LE PLAISIR D'ENFANT — learners in a robotics session",
  },
  {
    slug: 'ingobyi-innovation-hub-impact',
    title: 'Ingobyi Innovation Hub — 2026 Impact Report',
    date: '2026-05-10',
    excerpt: 'Over 300 students trained, 4 programs running, and partnerships with 12+ schools across Rwanda.',
    coverImage: '/blog-1/ingobyi-first-3.jpg',
    coverImageAlt: 'Ingobyi Innovation Hub impact 2026',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 },
};

const staggerItem = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

export default function HomePage() {
  const reduce = useReducedMotion();
  const [ti, setTi] = useState(0);
  const testimonial = TESTIMONIALS[ti % TESTIMONIALS.length]!;

  return (
    <div className="min-h-screen bg-white font-poppins antialiased">
      <ExploreNav showCatalogQuickNav={false} />

      <main id="main">
        {/* ── Hero ── */}
        <section className="relative w-full overflow-hidden border-b border-brand-green/8 bg-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(85vh,820px)] w-full">
            <img
              src="/landing/header-bg.png"
              alt=""
              className="h-full w-full object-cover object-center"
              width={1920}
              height={1500}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-white/72 to-white" />
          </div>
          <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 md:py-10 lg:px-8">
            <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-x-12">
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full min-w-0 max-w-xl"
              >
                <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                  Empowering Rwanda&apos;s Next Generation of Innovators
                </h1>
                <p className="mt-5 text-sm font-medium leading-relaxed text-brand-ink/70 sm:text-base md:text-lg">
                  Ingobyi Academy provides hands-on STEM education, creative arts, and digital skills training for Rwandan learners — online and in schools.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="h-12 rounded-full bg-brand-green px-8 text-base font-bold shadow-md hover:bg-brand-green-dark">
                    <Link href="/search">Get started</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-2 border-brand-green/25 bg-white/90 px-6 text-base font-bold text-brand-green backdrop-blur-sm hover:bg-brand-green/5">
                    <a href="#about-videos" className="inline-flex items-center gap-2">
                      <Play className="h-4 w-4 fill-brand-green" />
                      Watch video
                    </a>
                  </Button>
                </div>
                <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-brand-ink/55">
                  <span>300+ learners</span>
                  <span className="hidden h-1 w-1 rounded-full bg-brand-ink/30 sm:inline" />
                  <span>12+ partner schools</span>
                  <span className="hidden h-1 w-1 rounded-full bg-brand-ink/30 sm:inline" />
                  <span>Certificates on completion</span>
                </p>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex w-full min-w-0 justify-center lg:justify-end"
              >
                <img
                  src="/landing/hero.png"
                  alt="Ingobyi Academy students learning"
                  width={900}
                  height={1125}
                  className="h-auto max-h-[min(42vh,420px)] w-full max-w-sm object-contain sm:max-w-lg sm:max-h-[min(48vh,480px)] lg:max-h-[min(56vh,600px)] lg:max-w-2xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Success headline ── */}
        <section className="relative z-10 border-b border-brand-green/8 bg-white px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
              <h2 className="flex flex-wrap items-center justify-center gap-3 text-3xl font-extrabold leading-tight tracking-tight text-brand-ink md:text-4xl lg:justify-start">
                <Sparkles className="h-8 w-8 shrink-0 text-brand-green" strokeWidth={2} />
                Building skills that open doors
              </h2>
              <p className="mt-5 text-base font-medium leading-relaxed text-brand-ink/72 md:text-lg">
                Core Group Ltd empowers young people through digital skills, innovation, and practical education — with hands-on learning in robotics, software, embedded systems, and leadership that fits Rwandan schools and communities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="relative z-10 border-b border-brand-green/8 bg-white px-4 pb-12 pt-6 sm:px-6 md:pt-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...stagger} className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {[
                { value: '300+', label: 'Students trained' },
                { value: '4', label: 'Active programs' },
                { value: '12+', label: 'Partner schools' },
                { value: '15+', label: 'Skills offered' },
                { value: '100%', label: 'Locally made content' },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  {...staggerItem}
                  className="rounded-2xl border border-brand-green/8 bg-brand-mint-wash p-6 text-center shadow-sm"
                >
                  <p className="text-3xl font-extrabold text-brand-green md:text-4xl">{s.value}</p>
                  <p className="mt-2 text-sm font-medium text-brand-ink/65">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="border-b border-brand-green/8 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-brand-ink">What we offer</h2>
              <p className="mt-3 text-base text-brand-ink/65">Three pillars of learning delivered in schools, at the hub, and online.</p>
            </motion.div>
            <motion.div {...stagger} className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[
                { icon: PenLine, title: 'Online Courses', body: 'Self-paced digital courses covering STEM, creative arts, sports, and life skills for learners of all levels.', ring: 'bg-brand-yellow/25 text-brand-green' },
                { icon: School, title: 'School Programs', body: 'After-school activities and in-class STEM workshops delivered by trained instructors in partner schools across Rwanda.', ring: 'bg-brand-mint/35 text-brand-green' },
                { icon: Globe2, title: 'Innovation Hub', body: 'Bootcamps, competitions, and maker-space sessions at Ingobyi Innovation Hub in Kigali for hands-on exploration.', ring: 'bg-brand-green/10 text-brand-green' },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  {...staggerItem}
                  className="rounded-lg border border-brand-green/10 bg-white p-8 shadow-md transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${item.ring}`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-brand-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">{item.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── About videos ── */}
        <section id="about-videos" className="scroll-mt-24 border-b border-brand-green/8 bg-brand-mint-wash py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-brand-ink">See Ingobyi in action</h2>
              <p className="mt-3 text-base text-brand-ink/65">Watch learners build, code, and create at our hub and partner schools.</p>
            </motion.div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                { src: '/blog-1/ingobyi-first-2.jpg', label: 'Holiday bootcamp — STEM week at Ingobyi Hub' },
                { src: '/blog-2/school-2.jpeg', label: "Robotics at LE PLAISIR D'ENFANT school" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp}
                  className="group relative aspect-video overflow-hidden rounded-lg border border-brand-green/10 bg-brand-green shadow-sm"
                >
                  <img src={item.src} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-green/25">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-green shadow-sm">
                      <Play className="h-7 w-7 fill-current" />
                    </span>
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm font-bold text-white">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Alternating features ── */}
        <section className="border-b border-brand-green/8 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl space-y-14 px-4 sm:space-y-20 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-extrabold text-brand-ink">Learn with local mentors who understand your context</h2>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/65">Our instructors are trained Rwandan professionals who live and work in the communities where they teach. Every course and activity is designed for local needs, using locally produced resources.</p>
                <ul className="mt-6 space-y-3">
                  {['Curriculum mapped to Rwandan education standards', 'Locally made kits and materials', 'Kinyarwanda and English instruction'].map((line) => (
                    <li key={line} className="flex gap-3 text-sm font-medium text-brand-ink">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-mint/40 text-brand-green">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-hidden rounded-lg border border-brand-green/10 shadow-sm">
                <img src="/blog-1/ingobyi-first-4.jpg" alt="" className="aspect-[4/3] w-full object-cover" />
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="grid items-center gap-10 lg:grid-cols-2">
              <div className="order-2 overflow-hidden rounded-lg border border-brand-green/10 shadow-sm lg:order-1">
                <img src="/blog-1/ingobyi-first-5.jpg" alt="" className="aspect-[4/3] w-full object-cover" />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-extrabold text-brand-ink">Programs designed for schools and communities</h2>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/65">The VALUED After-School Program brings creative arts, sports, technology, and life skills to children during and after school hours — structured activities, certified coaches, and clear progress tracking.</p>
                <Button asChild variant="link" className="mt-4 h-auto p-0 text-base font-bold text-brand-green">
                  <Link href="/programs">Explore programs</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-extrabold text-brand-ink">Track progress and earn certificates</h2>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/65">Every enrolled student gets a personal dashboard with lesson progress, quiz results, and completion certificates they can share. Parents and administrators see live class reports.</p>
              </div>
              <div className="overflow-hidden rounded-lg border border-brand-green/10 shadow-sm">
                <img src="/blog-1/ingobyi-first-6.jpg" alt="" className="aspect-[4/3] w-full object-cover" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Discover courses ── */}
        <section id="discover-courses" className="scroll-mt-24 border-b border-brand-green/8 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green">Ingobyi Academy</p>
              <h2 className="mt-2 text-3xl font-extrabold text-brand-ink">Discover courses online</h2>
              <p className="mt-3 text-base text-brand-ink/65">
                Self-paced lessons, quizzes, and certificates — browse by topic or jump straight into search.
              </p>
            </motion.div>
            <motion.div {...stagger} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Technology & coding', href: '/search?category=technology', image: '/blog-1/ingobyi-first-9.jpg' },
                { label: 'Creative arts', href: '/search?category=creative-arts', image: '/blog-1/ingobyi-first-10.jpg' },
                { label: 'Life skills', href: '/search?category=skills', image: '/blog-1/ingobyi-first-11.jpg' },
                { label: 'Sports & wellness', href: '/search?category=sports', image: '/blog-2/school-3.jpeg' },
                { label: 'Media & content', href: '/search?category=media', image: '/blog-2/school-4.jpeg' },
                { label: 'Business basics', href: '/search?category=business', image: '/blog-2/school-5.jpeg' },
              ].map((cat) => (
                <motion.div key={cat.label} {...staggerItem}>
                  <Link
                    href={cat.href}
                    className="group flex overflow-hidden rounded-2xl border border-brand-green/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-green/25 hover:shadow-md"
                  >
                    <div className="h-24 w-28 shrink-0 overflow-hidden sm:h-28 sm:w-32">
                      <img src={cat.image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center px-4 py-3">
                      <p className="text-sm font-bold text-brand-ink group-hover:text-brand-green">{cat.label}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <motion.div {...fadeUp} className="mt-8 flex justify-center">
              <Button asChild size="lg" className="rounded-full bg-brand-green px-8 font-bold hover:bg-brand-green-dark">
                <Link href="/search">Browse all courses</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ── Trusted partners strip ── */}
        <section className="border-b border-brand-green/8 bg-brand-mint-wash/50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-brand-ink/50">
              Trusted by schools &amp; partners across Rwanda
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {[
                { src: '/logos/coregroup.png', alt: 'Core Group Ltd' },
                { src: '/partener/codebridge.jpg', alt: 'CodeBridge' },
                { src: '/partener/value-ed.jpeg', alt: 'Value Ed' },
                { src: '/partener/school-1.jpg', alt: "LE PLAISIR D'ENFANT" },
                { src: '/landing/ingoby-innovation-hub-green.png', alt: 'Ingobyi Innovation Hub' },
              ].map((logo) => (
                <div
                  key={logo.alt}
                  className="flex h-14 w-28 items-center justify-center rounded-xl border border-brand-green/8 bg-white px-3 py-2 shadow-sm sm:h-16 sm:w-36"
                >
                  <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Learning journey ── */}
        <section className="relative overflow-hidden bg-brand-green-darker py-14 text-white sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(140,230,107,0.18),transparent)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-mint">Your learning path</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">From beginner to builder in 4 steps</h2>
              <p className="mt-4 text-base leading-relaxed text-white/75">A clear, mentor-guided path from first login to certified achievement.</p>
            </motion.div>
            <div className="mx-auto mt-12 max-w-5xl">
              <ol className="grid gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-10 lg:grid-cols-4 lg:gap-6">
                {[
                  { Icon: BookOpen, step: '01', title: 'Choose your course', body: 'Browse the catalog and pick a topic you are passionate about — from coding to music to robotics.' },
                  { Icon: Cpu, step: '02', title: 'Learn with real kits', body: 'Follow video and text lessons with hands-on activities using locally made materials.' },
                  { Icon: ClipboardCheck, step: '03', title: 'Complete quizzes', body: 'Test your understanding with structured quizzes and assignments that measure real mastery.' },
                  { Icon: BadgeCheck, step: '04', title: 'Earn your certificate', body: 'Complete the course and download a shareable certificate — recognized by schools and employers.' },
                ].map((item) => (
                  <motion.li
                    key={item.step}
                    {...fadeUp}
                    className="relative flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm md:flex-col md:items-start"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-mint/20 text-brand-mint">
                      <item.Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-bold text-brand-mint/90">{item.step}</p>
                      <h3 className="mt-1 text-lg font-bold leading-snug">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/72">{item.body}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
              <motion.div {...fadeUp} className="mt-10 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="rounded-full bg-brand-mint px-8 font-bold text-brand-green-darker hover:bg-brand-mint-hover">
                  <Link href="/search">Browse courses</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent px-6 font-bold text-white hover:bg-white/10">
                  <Link href="/blog">Read success stories</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Team / Mentors ── */}
        <section id="mentors" className="scroll-mt-24 border-b border-brand-green/8 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-brand-ink">Meet your mentors</h2>
              <p className="mt-3 text-base text-brand-ink/65">Rwandan professionals passionate about education, technology, and youth development.</p>
            </motion.div>
            <motion.div {...stagger} className="mt-12 flex flex-wrap justify-center gap-4 md:gap-6">
              {TEAM.map((member) => (
                <motion.div
                  key={member.id}
                  {...staggerItem}
                  className="flex w-[140px] flex-col items-center text-center"
                >
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-brand-mint/50 shadow-sm">
                    <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-brand-ink">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="border-b border-brand-green/8 bg-white py-12 sm:py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-extrabold text-brand-ink">What students and partners say</h2>
              <p className="mt-4 text-base text-brand-ink/65">Real experiences from learners, parents, and educators across Rwanda.</p>
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-base font-bold text-brand-green">
                <Link href="/blog">Read our blog</Link>
              </Button>
            </motion.div>
            <motion.div {...fadeUp} className="relative">
              <div className="relative aspect-[4/5] max-h-[420px] overflow-hidden rounded-[28px] border border-brand-green/10 shadow-lg md:max-h-none">
                <img src="/blog-1/ingobyi-first-7.jpg" alt="Students at Ingobyi Innovation Hub" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="relative z-10 mx-4 mt-4 rounded-2xl border border-brand-green/10 bg-white p-6 shadow-lg md:absolute md:bottom-8 md:left-8 md:mx-0 md:mt-0 md:max-w-md">
                <div className="flex gap-1 text-brand-yellow">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-3 text-base font-medium leading-relaxed text-brand-ink">&ldquo;{testimonial.text}&rdquo;</p>
                <p className="mt-4 text-sm font-bold text-brand-green">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label="Previous" onClick={() => setTi((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label="Next" onClick={() => setTi((i) => (i + 1) % TESTIMONIALS.length)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Student achievements ── */}
        <section className="bg-gradient-to-b from-brand-gradient-light to-brand-gradient-mid py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-brand-ink">Student achievements</h2>
              <p className="mt-3 text-base leading-relaxed text-brand-ink/70">Skills our students are mastering across Rwanda&apos;s schools and at the Innovation Hub.</p>
            </motion.div>
            <motion.div {...stagger} className="mx-auto mt-12 max-w-5xl">
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  { skill: 'Robotics & STEM', value: 85, Icon: Cpu },
                  { skill: 'Coding & Software', value: 72, Icon: Code2 },
                  { skill: 'Problem Solving', value: 88, Icon: Lightbulb },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    {...staggerItem}
                    className="group relative flex flex-col items-center rounded-3xl border border-brand-mint/20 bg-white/60 p-8 backdrop-blur-sm transition-all duration-300 hover:border-brand-mint/50 hover:shadow-lg"
                  >
                    <div className="relative mb-4 h-24 w-24">
                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke={brand.green} strokeWidth="4" opacity="0.15" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={brand.mint} strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - item.value / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <item.Icon className="h-7 w-7 text-brand-mint" />
                        <span className="text-2xl font-bold text-brand-mint">{item.value}%</span>
                      </div>
                    </div>
                    <h3 className="text-center text-lg font-bold text-brand-ink">{item.skill}</h3>
                    <p className="mt-2 text-center text-xs text-brand-ink/60">Student mastery level</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-8">
              {[
                { label: 'Projects completed', value: '240+', color: brand.mint },
                { label: 'Active students', value: '450+', color: brand.green },
                { label: 'Skills offered', value: '15+', color: brand.mint },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-sm font-bold uppercase tracking-wide text-brand-ink/60">{stat.label}</p>
                  <p className="mt-1 text-3xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── News / Blog ── */}
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold text-brand-ink">News & stories</h2>
              <p className="mt-2 text-base text-muted-foreground">Field notes from our bootcamps, school partnerships, and programmes.</p>
            </motion.div>
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <motion.article {...fadeUp} className="overflow-hidden rounded-lg border border-brand-green/10 bg-brand-mint-wash shadow-sm">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img src={BLOG_POSTS[0]!.coverImage} alt={BLOG_POSTS[0]!.coverImageAlt} className="h-full w-full object-cover transition hover:scale-105" loading="lazy" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold text-brand-green">{BLOG_POSTS[0]!.date}</p>
                  <h3 className="mt-2 text-xl font-bold text-brand-ink">{BLOG_POSTS[0]!.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{BLOG_POSTS[0]!.excerpt}</p>
                  <Button asChild variant="link" className="mt-2 h-auto p-0 font-bold text-brand-green">
                    <Link href={`/blog/${BLOG_POSTS[0]!.slug}`}>Read more</Link>
                  </Button>
                </div>
              </motion.article>
              <div className="flex flex-col gap-4">
                {BLOG_POSTS.slice(1).map((post) => (
                  <motion.div key={post.slug} {...fadeUp} className="flex gap-4 rounded-lg border border-brand-green/10 bg-white p-3 shadow-sm">
                    <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <img src={post.coverImage} alt={post.coverImageAlt} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0 flex-1 py-1">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-green">{post.date}</p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-brand-ink">{post.title}</h3>
                      <Button asChild variant="link" className="mt-1 h-auto p-0 text-xs font-bold text-brand-green">
                        <Link href={`/blog/${post.slug}`}>Read more</Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Band ── */}
        <section className="border-y border-brand-green/8 bg-brand-green py-14 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to partner?</h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/75">
              Bring Ingobyi Academy to your school or team — cohorts, reporting, and content that matches how you already teach.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-brand-mint px-8 font-bold text-brand-green hover:bg-brand-mint-hover">
                <Link href="/contact">Contact us</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent px-6 font-bold text-white hover:bg-white/10">
                <Link href="/search">Browse courses</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
