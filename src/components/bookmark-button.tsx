'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { addToWishlist, checkWishlist, removeFromWishlist } from '@/lib/api/wishlist';
import { useAuthStore } from '@/lib/auth/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function BookmarkButton({ courseId, className }: { courseId: string; className?: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    checkWishlist(courseId, token)
      .then((r) => setSaved(r.saved))
      .catch(() => setSaved(false));
  }, [courseId, token]);

  async function toggle() {
    if (!token) {
      toast.error('Sign in to save courses');
      return;
    }
    setLoading(true);
    try {
      if (saved) {
        await removeFromWishlist(courseId, token);
        setSaved(false);
        toast.success('Removed from saved courses');
      } else {
        await addToWishlist(courseId, token);
        setSaved(true);
        toast.success('Course saved');
      }
    } catch {
      toast.error('Could not update saved courses');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove bookmark' : 'Save course'}
      className={cn(
        'rounded-full p-2 transition-colors hover:bg-muted',
        saved ? 'text-brand-green' : 'text-muted-foreground',
        className,
      )}
    >
      <Bookmark className={cn('h-5 w-5', saved && 'fill-current')} />
    </button>
  );
}
