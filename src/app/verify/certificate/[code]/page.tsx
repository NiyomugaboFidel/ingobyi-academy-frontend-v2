'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  BadgeCheck,
  ExternalLink,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { verifyCertificate } from '@/lib/api/certificates';
import { getErrorMessage } from '@/lib/api/errors';

export default function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const { data, error, isLoading } = useQuery({
    queryKey: ['certificate-verify', code],
    queryFn: () => verifyCertificate(code),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-mint-wash via-white to-white font-poppins">
      <header className="border-b border-brand-green/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandLogo size="sm" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-green">
            Certificate verification
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {isLoading && (
          <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
            <p className="mt-4 text-sm text-muted-foreground">Verifying certificate…</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-bold text-red-900">Certificate not found</h1>
            <p className="mt-2 text-sm text-red-800">
              {getErrorMessage(error, 'This verification code is invalid or has been revoked.')}
            </p>
            <Button asChild className="mt-6 bg-brand-green hover:bg-brand-green-dark">
              <Link href="/catalog">Browse courses</Link>
            </Button>
          </div>
        )}

        {data?.valid && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-green-200 bg-green-50 p-8 shadow-sm">
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <BadgeCheck className="h-9 w-9" />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-5 sm:flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                    Authentic certificate
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold text-green-950">
                    Verified on Ingobyi Academy
                  </h1>
                  <p className="mt-2 text-sm text-green-900">
                    This credential was issued by Ingobyi Innovation Hub and matches our records.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Learner
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-lg font-bold text-foreground">
                    <UserRound className="h-5 w-5 text-brand-green" />
                    {data.learner.name}
                    {data.learner.isVerified && (
                      <BadgeCheck className="h-4 w-4 text-brand-green" aria-label="Verified user" />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Course
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-lg font-bold text-foreground">
                    <Award className="h-5 w-5 text-brand-green" />
                    {data.course.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Issued
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {new Date(data.issuedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Issued by
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {data.issuedBy}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Verification code
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                    {data.verifyCode}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-brand-green/15 bg-brand-mint-wash/50 p-6">
              <h2 className="text-base font-bold text-brand-ink">View achievement profile</h2>
              <p className="mt-2 text-sm text-brand-muted">
                See this learner&apos;s public community profile, achievements, and course completion
                record on Ingobyi Academy.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild className="bg-brand-green hover:bg-brand-green-dark">
                  <Link href={`/users/${data.userId}?tab=achievements&cert=${encodeURIComponent(data.verifyCode)}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open learner achievements
                  </Link>
                </Button>
                {data.course.slug && (
                  <Button asChild variant="outline">
                    <Link href={`/catalog/${data.course.slug}`}>View course</Link>
                  </Button>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
