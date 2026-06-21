'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { LearningShell } from '@/components/layout/learning-shell';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { downloadCertificatePdf, listMyCertificates } from '@/lib/api/certificates';
import { getErrorMessage } from '@/lib/api/errors';
import { learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';

export default function StudentCertificatesPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: certificates = [], isLoading, error, refetch } = useQuery({
    queryKey: learningKeys.myCertificates(),
    queryFn: () => listMyCertificates(token),
    enabled: !!token,
    refetchOnWindowFocus: true,
  });

  async function handleDownload(certId: string, courseTitle: string) {
    setDownloadingId(certId);
    try {
      const safeName = courseTitle.replace(/[^\w\s-]/g, '').trim() || 'certificate';
      await downloadCertificatePdf(certId, token, `${safeName}.pdf`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <LearningShell allowedRoles={['STUDENT', 'SUPERADMIN']}>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your earned credentials and completion certificates.</p>
      </div>

      {error && <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} className="mb-4" />}

      {!isLoading && certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn your first certificate."
          primaryAction={{ label: 'Browse courses', href: '/catalog' }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div key={cert.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10">
                  <Award className="h-6 w-6 text-brand-green" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{cert.course?.title ?? 'Course certificate'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Issued {new Date(cert.issuedAt).toLocaleDateString()} · Code {cert.verifyCode}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cert.course?.slug && (
                      <Link href={`/catalog/${cert.course.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" /> View course
                      </Link>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={downloadingId === cert.id}
                      onClick={() =>
                        void handleDownload(cert.id, cert.course?.title ?? 'certificate')
                      }
                      className="h-8 rounded-full border-brand-green/30 text-xs font-semibold text-brand-green hover:bg-brand-green/5"
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      {downloadingId === cert.id ? 'Downloading…' : 'Download PDF'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </LearningShell>
  );
}
