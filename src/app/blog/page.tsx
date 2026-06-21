import Link from 'next/link';
import { LandingPageShell } from '@/components/landing/landing-page-shell';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingSectionHeader } from '@/components/landing/landing-section-header';
import { Calendar, Clock } from 'lucide-react';

const BLOG_POSTS = [
  {
    slug: 'stem-and-schools-in-rwanda',
    title: 'First holiday bootcamp at Ingobyi Innovation Hub',
    date: 'April 18, 2026',
    readTime: '6 min read',
    excerpt: 'Our first bootcamp at Ingobyi Innovation Hub welcomed twenty students for hands-on holiday training in STEM — building, coding, and confidence together.',
    coverImage: '/blog-1/ingobyi-first-1.jpg',
    coverImageAlt: 'Ingobyi Innovation Hub — holiday STEM bootcamp',
    category: 'STEM',
  },
  {
    slug: 'building-products-with-partners',
    title: "Robotics and embedded systems at LE PLAISIR D'ENFANT",
    date: 'April 25, 2026',
    readTime: '5 min read',
    excerpt: "Starting young with robotics and embedded systems at LE PLAISIR D'ENFANT (École Active Bilingue) — a bilingual active school in Gasabo, Rwanda.",
    coverImage: '/blog-2/school-1.jpeg',
    coverImageAlt: "LE PLAISIR D'ENFANT — learners in a robotics session",
    category: 'Partnership',
  },
  {
    slug: 'ingobyi-innovation-hub-impact',
    title: 'Ingobyi Innovation Hub — 2026 Impact Report',
    date: 'May 10, 2026',
    readTime: '8 min read',
    excerpt: 'Over 300 students trained, 4 programs running, and partnerships with 12+ schools across Rwanda — here is how we got here.',
    coverImage: '/blog-1/ingobyi-first-3.jpg',
    coverImageAlt: 'Ingobyi Innovation Hub impact 2026',
    category: 'Impact',
  },
  {
    slug: 'coding-clubs-in-schools',
    title: 'How coding clubs are changing school culture in Rwanda',
    date: 'May 18, 2026',
    readTime: '4 min read',
    excerpt: 'Students who once feared technology are now building games and apps. A look inside Ingobyi Innovation Clubs in five partner schools.',
    coverImage: '/blog-1/ingobyi-first-5.jpg',
    coverImageAlt: 'Students coding in a school innovation club',
    category: 'Education',
  },
  {
    slug: 'creative-arts-program',
    title: 'Music, dance, and art: the creative side of Ingobyi Academy',
    date: 'May 28, 2026',
    readTime: '5 min read',
    excerpt: 'The VALUED After-School Program is not only about coding and robotics — creative arts are a core part of our holistic education approach.',
    coverImage: '/blog-1/ingobyi-first-6.jpg',
    coverImageAlt: 'Creative arts program at Ingobyi',
    category: 'Programs',
  },
];

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <LandingPageShell>
      <LandingHero
        variant="light"
        eyebrow="News & stories"
        title="Field notes from Ingobyi"
        description="Bootcamps, school partnerships, and programme updates from Core Group Rwanda — with photos from our learners and mentors."
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group mb-12 block">
              <div className="grid gap-0 overflow-hidden rounded-2xl border border-brand-green/10 bg-white shadow-sm lg:grid-cols-2">
                <div className="aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[320px]">
                  <img
                    src={featured.coverImage}
                    alt={featured.coverImageAlt}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-8">
                  <span className="inline-flex w-fit rounded-full bg-brand-green/8 px-3 py-1 text-xs font-bold text-brand-green">
                    {featured.category}
                  </span>
                  <h2 className="mt-3 text-2xl font-extrabold text-brand-ink group-hover:text-brand-green md:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/70">{featured.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {featured.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                  <span className="mt-5 inline-flex w-fit font-bold text-brand-green underline-offset-2 group-hover:underline">
                    Read more →
                  </span>
                </div>
              </div>
            </Link>
          )}

          <LandingSectionHeader
            align="left"
            title="More stories"
            className="mb-8"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-brand-green/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[16/10] overflow-hidden bg-brand-mint-wash">
                  <img
                    src={post.coverImage}
                    alt={post.coverImageAlt}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="inline-flex w-fit rounded-full bg-brand-green/8 px-2.5 py-0.5 text-[10px] font-bold text-brand-green">
                    {post.category}
                  </span>
                  <h2 className="mt-2 line-clamp-2 text-base font-bold text-brand-ink group-hover:text-brand-green">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-brand-ink/65">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </LandingPageShell>
  );
}
