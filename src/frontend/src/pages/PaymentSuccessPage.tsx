import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useProcessCoursePayment } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const processMutation = useProcessCoursePayment();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('courseId');
    const sessionId = params.get('sessionId');

    if (courseId && sessionId) {
      processMutation.mutate(
        {
          providerId: 'stripe',
          courseId,
          stripeSessionId: sessionId
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              router.navigate({ to: '/dashboard' });
            }, 3000);
          },
          onError: (error: Error) => {
            toast.error(error.message || 'Failed to process payment');
          }
        }
      );
    }
  }, []);

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            {processMutation.isPending ? (
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            )}
            <CardTitle className="text-2xl">
              {processMutation.isPending ? 'Processing Payment...' : 'Payment Successful!'}
            </CardTitle>
            <CardDescription>
              {processMutation.isPending
                ? 'Please wait while we process your payment and enroll you in the course.'
                : 'You have been successfully enrolled in the course. Redirecting to your dashboard...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {!processMutation.isPending && (
              <Button onClick={() => router.navigate({ to: '/dashboard' })} className="w-full">
                Go to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
