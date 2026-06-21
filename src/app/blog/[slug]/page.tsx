import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LandingPageShell } from '@/components/landing/landing-page-shell';
import { LandingCtaBand } from '@/components/landing/landing-cta-band';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';

const BLOG_POSTS: Record<string, {
  title: string; date: string; readTime: string; coverImage: string; coverImageAlt: string;
  category: string; body: string[]; gallery?: string[]; youtubeId?: string;
}> = {
  'stem-and-schools-in-rwanda': {
    title: 'First holiday bootcamp at Ingobyi Innovation Hub',
    date: 'April 18, 2026',
    readTime: '6 min read',
    coverImage: '/blog-1/ingobyi-first-1.jpg',
    coverImageAlt: 'Ingobyi Innovation Hub — holiday STEM bootcamp',
    category: 'STEM',
    youtubeId: 'BXJYaclZ6Ic',
    gallery: Array.from({ length: 11 }, (_, i) => `/blog-1/ingobyi-first-${i + 1}.jpg`),
    body: [
      'Ingobyi Innovation Hub is Core Group\'s centre for technology education and experimentation in Kigali. During the holidays we ran our first structured bootcamp and trained the first twenty students — mixing robotics, electronics, and problem-solving in a calm, mentor-led rhythm.',
      'The gallery below captures moments from that week: learners pairing up on kits, facilitators checking circuits, and the small wins that add up to real confidence.',
      'We designed the block so it could repeat: clear outcomes each day, materials we can source locally, and notes teachers can reuse. That keeps Ingobyi useful beyond a single holiday cohort.',
      'If you represent a school, hub, or community programme and want similar blocks at your site, use our contact page — we are actively growing partners who care about depth, safety, and follow-through.',
    ],
  },
  'building-products-with-partners': {
    title: "Robotics and embedded systems at LE PLAISIR D'ENFANT",
    date: 'April 25, 2026',
    readTime: '5 min read',
    coverImage: '/blog-2/school-1.jpeg',
    coverImageAlt: "LE PLAISIR D'ENFANT — learners in a robotics session",
    category: 'Partnership',
    gallery: ['/blog-2/school-1.jpeg', '/blog-2/school-2.jpeg', '/blog-2/school-3.jpeg', '/blog-2/school-4.jpeg', '/blog-2/school-5.jpeg'],
    body: [
      "LE PLAISIR D'ENFANT (École Active Bilingue) welcomes families from baby class through primary with a joyful, structured approach to learning. Core Group is proud to support their journey into robotics and embedded systems.",
      'In the classroom we emphasise patterns children can see: lights responding to code, sensors reacting to touch, and simple boards they can handle safely.',
      'Teachers stay in the lead; we bring kits, facilitator notes, and on-site coaching so the rhythm survives after we leave.',
    ],
  },
  'ingobyi-innovation-hub-impact': {
    title: 'Ingobyi Innovation Hub — 2026 Impact Report',
    date: 'May 10, 2026',
    readTime: '8 min read',
    coverImage: '/blog-1/ingobyi-first-3.jpg',
    coverImageAlt: 'Ingobyi Innovation Hub impact 2026',
    category: 'Impact',
    body: [
      'In 2026, Ingobyi Innovation Hub reached 300+ students across Rwanda, running 4 active programs and partnering with 12+ schools. This report looks at what we achieved and where we are heading.',
      'Our Technology programs — coding, robotics, and embedded systems — had the highest engagement, with students building projects that range from LED circuits to autonomous obstacle-avoiders.',
      'Creative arts saw strong enrollment too, with music, dance, and painting programs running in 5 schools with certified coaches.',
      'Looking ahead, we plan to expand our online course catalog, add 6 more school partnerships, and launch a community innovation challenge for secondary students.',
    ],
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) notFound();

  return (
    <LandingPageShell>
      <article className="py-8 md:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green transition hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to news
          </Link>

          <div className="aspect-[16/8] w-full overflow-hidden rounded-2xl border border-brand-green/10 bg-brand-mint-wash shadow-md">
            <img src={post.coverImage} alt={post.coverImageAlt} className="h-full w-full object-cover" loading="eager" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-green/8 px-3 py-1 text-xs font-bold text-brand-green">{post.category}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold leading-tight text-brand-ink sm:text-3xl md:text-4xl">{post.title}</h1>

          <div className="mt-8 space-y-5">
            {post.body.map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-brand-ink/80">{paragraph}</p>
            ))}
          </div>

          {post.youtubeId && (
            <div className="mt-10 aspect-video w-full overflow-hidden rounded-2xl border border-brand-green/10 shadow-sm">
              <iframe
                src={`https://www.youtube.com/embed/${post.youtubeId}?rel=0`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={post.title}
              />
            </div>
          )}

          {post.gallery && post.gallery.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-lg font-extrabold text-brand-ink">Gallery</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {post.gallery.map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl border border-brand-green/8 bg-brand-mint-wash shadow-sm">
                    <img src={src} alt="" className="h-full w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <LandingCtaBand
        title="Want to partner with Ingobyi?"
        description="Bring our programs to your school or community — we handle kits, coaching, and curriculum."
        actions={
          <>
            <Button asChild className="rounded-full bg-brand-mint font-bold text-brand-green-darker hover:bg-brand-mint-hover">
              <Link href="/contact">Contact us</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/30 bg-transparent font-bold text-white hover:bg-white/10">
              <Link href="/programs">View programs</Link>
            </Button>
          </>
        }
      />
    </LandingPageShell>
  );
}
