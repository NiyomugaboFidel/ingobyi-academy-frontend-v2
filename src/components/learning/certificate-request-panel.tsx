'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Clock, Download, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  downloadCertificatePdf,
  getCertificateRequestStatus,
  requestCertificate,
} from '@/lib/api/certificates';
import { getErrorMessage } from '@/lib/api/errors';
import {
  certificateRequestPollInterval,
  invalidateAfterCertificateAction,
  learningKeys,
} from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';

type Props = {
  courseId: string;
  enrollmentStatus: string;
  progressPercent: number;
};

export function CertificateRequestPanel({
  courseId,
  enrollmentStatus,
  progressPercent,
}: Props) {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const readyForCertificate = progressPercent >= 100 || enrollmentStatus === 'COMPLETED';

  const { data, isLoading } = useQuery({
    queryKey: learningKeys.certificateRequest(courseId),
    queryFn: () => getCertificateRequestStatus(courseId, token),
    enabled: !!token && readyForCertificate,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => certificateRequestPollInterval(query.state.data),
  });

  async function handleRequest() {
    setSubmitting(true);
    try {
      await requestCertificate(courseId, token);
      toast.success('Certificate request sent to admin for approval');
      await invalidateAfterCertificateAction(queryClient, courseId);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!readyForCertificate) return null;

  if (enrollmentStatus !== 'COMPLETED') {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">Almost there!</p>
        <p className="mt-1 text-sm text-amber-800">
          Finish all lessons — including any quiz and graded assignment — before you can request your certificate.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 animate-pulse rounded-xl border border-brand-green/15 bg-brand-mint-wash/40 p-5">
        <div className="h-5 w-48 rounded bg-brand-green/10" />
      </div>
    );
  }

  if (data?.certificate) {
    async function handleDownload() {
      if (!data?.certificate) return;
      setDownloading(true);
      try {
        await downloadCertificatePdf(
          data.certificate.id,
          token,
          'certificate.pdf',
        );
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setDownloading(false);
      }
    }

    return (
      <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Award className="mt-0.5 h-6 w-6 text-green-700" />
            <div>
              <h3 className="font-bold text-green-900">Certificate issued</h3>
              <p className="mt-1 text-sm text-green-800">
                Your certificate was approved. Download your PDF or view it in My Certificates.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={downloading}
              onClick={() => void handleDownload()}
              className="rounded-full bg-brand-green hover:bg-brand-green-dark"
            >
              <Download className="mr-1.5 h-4 w-4" />
              {downloading ? 'Downloading…' : 'Download PDF'}
            </Button>
            <Button asChild variant="outline" className="rounded-full border-green-300 bg-white">
              <Link href="/student/certificates">My Certificates</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (data?.request?.status === 'PENDING') {
    return (
      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-6 w-6 text-blue-700" />
          <div>
            <h3 className="font-bold text-blue-900">Certificate request pending</h3>
            <p className="mt-1 text-sm text-blue-800">
              An administrator will review your completion and approve your certificate.
            </p>
            <p className="mt-2 text-xs text-blue-700">
              Requested {new Date(data.request.requestedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (data?.request?.status === 'REJECTED') {
    return (
      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-6 w-6 text-red-700" />
            <div>
              <h3 className="font-bold text-red-900">Certificate request declined</h3>
              {data.request.reviewNote && (
                <p className="mt-1 text-sm text-red-800">{data.request.reviewNote}</p>
              )}
              <p className="mt-2 text-sm text-red-800">
                You may submit a new request after addressing the feedback.
              </p>
            </div>
          </div>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => void handleRequest()}
            className="shrink-0 rounded-full bg-brand-green hover:bg-brand-green-dark"
          >
            Request again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-brand-green/20 bg-brand-mint-wash p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-brand-ink">Course finished — request your certificate</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Submit a request to your organization admin. Once approved, your certificate will appear in My Certificates.
          </p>
        </div>
        <Button
          type="button"
          disabled={submitting}
          onClick={() => void handleRequest()}
          className="shrink-0 rounded-full bg-brand-green px-6 font-bold hover:bg-brand-green-dark"
        >
          <Send className="mr-1.5 h-4 w-4" />
          {submitting ? 'Sending…' : 'Request certificate'}
        </Button>
      </div>
    </div>
  );
}
