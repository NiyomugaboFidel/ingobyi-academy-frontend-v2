'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addOrgMember } from '@/lib/api/organizations';
import { createPlatformUser } from '@/lib/api/superadmin';
import { getErrorMessage } from '@/lib/api/errors';
import type { UserRole } from '@/lib/api/types';

type AddUserPanelProps = {
  token: string;
  mode: 'org' | 'superadmin';
  orgId?: string;
  onSuccess?: () => void;
};

export function AddUserPanel({ token, mode, orgId, onSuccess }: AddUserPanelProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [adding, setAdding] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      if (mode === 'superadmin') {
        await createPlatformUser(token, {
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
          organizationId: orgId,
          orgRole: role,
        });
      } else {
        if (!orgId) throw new Error('No organization selected');
        await addOrgMember(orgId, token, {
          email: email.trim(),
          role,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          password: password || undefined,
        });
      }
      toast.success('User added — they can sign in without email verification');
      setEmail('');
      setFirstName('');
      setLastName('');
      setPassword('password123');
      setRole('STUDENT');
      onSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-3 rounded-xl border border-brand-green/10 bg-white p-4"
    >
      <p className="text-sm font-semibold text-brand-ink">Add user</p>
      <p className="text-xs text-brand-muted">
        Verified automatically — share email and password with the user (no OTP email needed).
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-brand-muted">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="h-10"
          />
        </div>
        <div className="min-w-[120px]">
          <label className="mb-1 block text-xs font-semibold text-brand-muted">First name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            required
            className="h-10"
          />
        </div>
        <div className="min-w-[120px]">
          <label className="mb-1 block text-xs font-semibold text-brand-muted">Last name</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
            className="h-10"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-xs font-semibold text-brand-muted">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="h-10"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-brand-muted">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="h-10 rounded-md border border-brand-green/18 bg-white px-3 text-sm"
          >
            <option value="STUDENT">Student</option>
            <option value="TRAINER">Trainer</option>
            <option value="PARENT">Parent</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <Button
          type="submit"
          disabled={adding}
          className="h-10 gap-1.5 bg-brand-green hover:bg-brand-green-dark"
        >
          <UserPlus className="h-4 w-4" />
          Add user
        </Button>
      </div>
    </form>
  );
}
