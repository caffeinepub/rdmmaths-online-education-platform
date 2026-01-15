import { useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <CardDescription>
              Your payment was not completed. Please try again or contact support if the problem persists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => router.navigate({ to: '/courses' })} className="w-full">
              Browse Courses
            </Button>
            <Button onClick={() => router.navigate({ to: '/' })} variant="outline" className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
