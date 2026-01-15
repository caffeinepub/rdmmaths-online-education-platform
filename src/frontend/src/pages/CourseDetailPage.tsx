import { useParams, useRouter } from '@tanstack/react-router';
import { useGetCourse, useGetCourseReviews, useGetCourseAverageRating, useEnrollInCourse, useGetMyEnrolledCourses, useGetInstructor, useSubmitReview, useCreateCheckoutSession } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, BookOpen, Award, Star, Video, Loader2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CourseDetailPage() {
  const { courseId } = useParams({ from: '/courses/$courseId' });
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { data: course, isLoading } = useGetCourse(courseId);
  const { data: reviews = [] } = useGetCourseReviews(courseId);
  const { data: averageRating } = useGetCourseAverageRating(courseId);
  const { data: enrolledCourses = [] } = useGetMyEnrolledCourses();
  const { data: instructor } = useGetInstructor(course?.instructor || '');
  const enrollMutation = useEnrollInCourse();
  const submitReviewMutation = useSubmitReview();
  const createCheckout = useCreateCheckoutSession();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const isEnrolled = enrolledCourses.some((c) => c.id === courseId);
  const isAuthenticated = !!identity;

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in courses');
      return;
    }

    if (course?.isFree) {
      await enrollMutation.mutateAsync(courseId);
    } else {
      // Redirect to payment
      handlePayment();
    }
  };

  const handlePayment = async () => {
    if (!course) return;

    try {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const session = await createCheckout.mutateAsync({
        items: [
          {
            productName: course.title,
            productDescription: course.description,
            priceInCents: course.price,
            currency: 'USD',
            quantity: BigInt(1)
          }
        ],
        successUrl: `${baseUrl}/payment-success?courseId=${courseId}&sessionId={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/payment-failure`
      });

      window.location.href = session.url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create checkout session');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !identity) {
      toast.error('Please login to submit a review');
      return;
    }

    if (!isEnrolled) {
      toast.error('You must be enrolled in this course to submit a review');
      return;
    }

    await submitReviewMutation.mutateAsync({
      userId: identity.getPrincipal(),
      courseId,
      rating: BigInt(rating),
      comment: comment.trim(),
      submittedAt: BigInt(Date.now() * 1000000)
    });

    setComment('');
    setRating(5);
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge>{course.category}</Badge>
              <Badge variant="outline">{course.difficulty}</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{course.description}</p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{Number(course.duration)} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>{course.videos.length} videos</span>
              </div>
              {averageRating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Instructor Info */}
          {instructor && (
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/assets/generated/default-instructor.png" />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{instructor.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{instructor.bio}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {Number(instructor.experience)} years experience
                      </span>
                    </div>
                    {instructor.qualifications.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Qualifications:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {instructor.qualifications.map((qual, idx) => (
                            <li key={idx}>{qual}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Content Tabs */}
          <Tabs defaultValue="curriculum" className="space-y-4">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum">
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>What you'll learn in this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.curriculum.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prerequisites">
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                  <CardDescription>What you need to know before starting</CardDescription>
                </CardHeader>
                <CardContent>
                  {course.prerequisites.length === 0 ? (
                    <p className="text-muted-foreground">No prerequisites required</p>
                  ) : (
                    <ul className="space-y-2">
                      {course.prerequisites.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Award className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {isEnrolled && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="comment">Comment</Label>
                          <Textarea
                            id="comment"
                            placeholder="Share your experience with this course..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={submitReviewMutation.isPending}>
                          {submitReviewMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Review'
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {reviews.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No reviews yet. Be the first to review this course!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">Student</span>
                            </div>
                            <div className="flex gap-1">
                              {Array.from({ length: Number(review.rating) }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center">
              <img
                src="/assets/generated/course-placeholder.png"
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="text-3xl font-bold text-primary mb-4">
                {course.isFree ? 'FREE' : `$${(Number(course.price) / 100).toFixed(2)}`}
              </div>
              {isEnrolled ? (
                <Button className="w-full" onClick={() => router.navigate({ to: '/dashboard' })}>
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending || createCheckout.isPending}
                >
                  {enrollMutation.isPending || createCheckout.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : course.isFree ? (
                    'Enroll Now'
                  ) : (
                    'Purchase Course'
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{Number(course.duration)} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Videos</span>
                  <span className="font-medium">{course.videos.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium">{course.difficulty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{course.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
