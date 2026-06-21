import { useQuery } from '@tanstack/react-query';
import { getCourseProgress } from '@/lib/api/progress';
import { courseProgressPollInterval, learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';

export function useLearningProgress(courseId: string | null | undefined) {
  const token = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: learningKeys.courseProgress(courseId ?? ''),
    queryFn: () => getCourseProgress(courseId!, token!),
    enabled: !!courseId && !!token,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => courseProgressPollInterval(query.state.data),
  });
}
