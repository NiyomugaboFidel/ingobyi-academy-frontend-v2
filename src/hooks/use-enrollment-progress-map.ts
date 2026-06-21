import { useQuery } from '@tanstack/react-query';
import { getCourseProgress } from '@/lib/api/progress';

type EnrollmentItem = {
  id: string;
  status: string;
  course: { id: string };
};

export function useEnrollmentProgressMap(
  enrollments: EnrollmentItem[],
  token: string | null | undefined,
) {
  const courseIds = enrollments.map((e) => e.course.id).join(',');

  return useQuery({
    queryKey: ['progress', 'all', courseIds],
    queryFn: async () => {
      const map: Record<string, number> = {};
      await Promise.all(
        enrollments.map(async (e) => {
          try {
            const p = await getCourseProgress(e.course.id, token!);
            map[e.course.id] = p.completionPercent;
          } catch {
            map[e.course.id] = e.status === 'COMPLETED' ? 100 : 0;
          }
        }),
      );
      return map;
    },
    enabled: !!token && enrollments.length > 0,
    refetchOnWindowFocus: true,
  });
}
