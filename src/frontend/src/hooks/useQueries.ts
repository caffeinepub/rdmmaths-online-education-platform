import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Course, UserProfile, Review, Instructor, LiveClass, Video } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    }
  });
}

export function useGetAllCourses() {
  const { actor, isFetching } = useActor();

  return useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching
  });
}

export function useGetCourse(courseId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCourse(courseId);
    },
    enabled: !!actor && !isFetching && !!courseId
  });
}

export function useGetMyEnrolledCourses() {
  const { actor, isFetching } = useActor();

  return useQuery<Course[]>({
    queryKey: ['myEnrolledCourses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEnrolledCourses();
    },
    enabled: !!actor && !isFetching
  });
}

export function useEnrollInCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.enrollInCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEnrolledCourses'] });
      toast.success('Successfully enrolled in course');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enroll in course');
    }
  });
}

export function useGetCourseVideos(courseId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Video[]>({
    queryKey: ['courseVideos', courseId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourseVideos(courseId);
    },
    enabled: !!actor && !isFetching && !!courseId
  });
}

export function useGetCourseReviews(courseId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['courseReviews', courseId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourseReviews(courseId);
    },
    enabled: !!actor && !isFetching && !!courseId
  });
}

export function useGetCourseAverageRating(courseId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<number | null>({
    queryKey: ['courseRating', courseId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCourseAverageRating(courseId);
    },
    enabled: !!actor && !isFetching && !!courseId
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: Review) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitReview(review);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseReviews', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courseRating', variables.courseId] });
      toast.success('Review submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit review');
    }
  });
}

export function useGetUpcomingLiveClasses() {
  const { actor, isFetching } = useActor();

  return useQuery<LiveClass[]>({
    queryKey: ['upcomingLiveClasses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUpcomingLiveClasses();
    },
    enabled: !!actor && !isFetching
  });
}

export function useGetAllInstructors() {
  const { actor, isFetching } = useActor();

  return useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInstructors();
    },
    enabled: !!actor && !isFetching
  });
}

export function useGetInstructor(instructorId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Instructor | null>({
    queryKey: ['instructor', instructorId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getInstructor(instructorId);
    },
    enabled: !!actor && !isFetching && !!instructorId
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
      toast.success('Stripe configuration saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save Stripe configuration');
    }
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: {
      items: Array<{
        productName: string;
        productDescription: string;
        priceInCents: bigint;
        currency: string;
        quantity: bigint;
      }>;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(params.items, params.successUrl, params.cancelUrl);
      return JSON.parse(result) as { id: string; url: string };
    }
  });
}

export function useProcessCoursePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { providerId: string; courseId: string; stripeSessionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.processCoursePayment(params.providerId, params.courseId, params.stripeSessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEnrolledCourses'] });
      toast.success('Payment processed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process payment');
    }
  });
}

export function useCreateCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { course: Course; adminKey: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createCourse(params.course, params.adminKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create course');
    }
  });
}

export function useAddInstructor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { instructor: Instructor; adminKey: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addInstructor(params.instructor, params.adminKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success('Instructor added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add instructor');
    }
  });
}

export function useScheduleLiveClass() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { liveClass: LiveClass; adminKey: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.scheduleLiveClass(params.liveClass, params.adminKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingLiveClasses'] });
      toast.success('Live class scheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to schedule live class');
    }
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching
  });
}

export function useSetAdminKey() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (newKey: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setAdminKey(newKey);
    },
    onSuccess: () => {
      toast.success('Admin key set successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set admin key');
    }
  });
}

export function useVerifyAdminKey() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (providedKey: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyAdminKey(providedKey);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify admin key');
    }
  });
}
