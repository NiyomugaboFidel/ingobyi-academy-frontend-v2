'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { awardCustomAchievement } from '@/lib/api/achievements';
import { getErrorMessage } from '@/lib/api/errors';

type Props = {
  userId: string;
  userName: string;
  token: string;
  className?: string;
};

export function AddAchievementForm({ userId, userName, token, className }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('15');

  const mutation = useMutation({
    mutationFn: () =>
      awardCustomAchievement(token, {
        userId,
        title: title.trim(),
        description: description.trim(),
        points: Number(points) || 15,
      }),
    onSuccess: () => {
      toast.success(`Achievement added for ${userName}`);
      setTitle('');
      setDescription('');
      setPoints('15');
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['achievements', userId] });
      void queryClient.invalidateQueries({ queryKey: ['community', 'profile', userId] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Plus className="mr-1.5 h-4 w-4" /> Add achievement
      </Button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;
        mutation.mutate();
      }}
      className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-violet-950">
        <Sparkles className="h-4 w-4" />
        Award recognition to {userName}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Robotics competition winner"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-green/40"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did they accomplish?"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-green/40"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-foreground">Points</label>
          <input
            type="number"
            min={1}
            max={500}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-green/40"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={mutation.isPending || !title.trim() || !description.trim()}
          className="rounded-full bg-brand-green hover:bg-brand-green-dark"
        >
          {mutation.isPending ? 'Saving…' : 'Save achievement'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
