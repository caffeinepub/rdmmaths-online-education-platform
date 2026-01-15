import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsCallerAdmin,
  useSetStripeConfiguration,
  useIsStripeConfigured,
  useCreateCourse,
  useAddInstructor,
  useScheduleLiveClass,
  useVerifyAdminKey
} from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, CreditCard, BookOpen, Users, Calendar, Lock, Coins, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();
  const createCourse = useCreateCourse();
  const addInstructor = useAddInstructor();
  const scheduleLiveClass = useScheduleLiveClass();
  const verifyAdminKey = useVerifyAdminKey();

  const [showAdminKeyDialog, setShowAdminKeyDialog] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [isAdminKeyVerified, setIsAdminKeyVerified] = useState(false);
  const [stripeKey, setStripeKey] = useState('');
  const [allowedCountries, setAllowedCountries] = useState('US,CA,GB');

  // Mock coin management data
  const mockUserCoins = [
    { user: 'user1...abc', name: 'Sarah Johnson', balance: 15420n, level: 12 },
    { user: 'user2...def', name: 'Michael Chen', balance: 14850n, level: 11 },
    { user: 'user3...ghi', name: 'Emma Williams', balance: 13990n, level: 11 }
  ];

  const handleVerifyAdminKey = async () => {
    try {
      const isValid = await verifyAdminKey.mutateAsync(adminKeyInput);
      if (isValid) {
        setIsAdminKeyVerified(true);
        setShowAdminKeyDialog(false);
        toast.success('Admin key verified successfully');
      } else {
        toast.error('Invalid admin key');
      }
    } catch (error) {
      toast.error('Failed to verify admin key');
    }
  };

  const handleStripeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminKeyVerified) {
      setShowAdminKeyDialog(true);
      return;
    }

    try {
      await setStripeConfig.mutateAsync({
        secretKey: stripeKey,
        allowedCountries: allowedCountries.split(',').map((c) => c.trim())
      });
      setStripeKey('');
    } catch (error) {
      console.error('Stripe setup error:', error);
    }
  };

  if (!identity) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Please login to access the admin panel</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading admin panel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You do not have admin access</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Settings className="h-10 w-10" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage courses, instructors, payments, and rewards</p>
      </div>

      <Alert className="mb-6">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Some administrative functions require a special admin key for additional security. You will be prompted to
          enter it when needed.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="stripe" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="stripe">
            <CreditCard className="h-4 w-4 mr-2" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="instructors">
            <Users className="h-4 w-4 mr-2" />
            Instructors
          </TabsTrigger>
          <TabsTrigger value="live-classes">
            <Calendar className="h-4 w-4 mr-2" />
            Live Classes
          </TabsTrigger>
          <TabsTrigger value="coins">
            <Coins className="h-4 w-4 mr-2" />
            Coins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Payment Configuration</CardTitle>
              <CardDescription>
                {stripeConfigured
                  ? 'Stripe is configured and ready to accept payments'
                  : 'Configure Stripe to enable course payments'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStripeSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripeKey">Stripe Secret Key</Label>
                  <Input
                    id="stripeKey"
                    type="password"
                    placeholder="sk_test_..."
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
                  <Input
                    id="countries"
                    placeholder="US,CA,GB"
                    value={allowedCountries}
                    onChange={(e) => setAllowedCountries(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={setStripeConfig.isPending}>
                  {setStripeConfig.isPending ? 'Saving...' : 'Save Configuration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Create and manage courses (requires admin key)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Course creation form will be implemented here.</p>
              <Button className="mt-4" onClick={() => setShowAdminKeyDialog(true)}>
                Create New Course
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructors">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Management</CardTitle>
              <CardDescription>Add and manage instructors (requires admin key)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Instructor management form will be implemented here.</p>
              <Button className="mt-4" onClick={() => setShowAdminKeyDialog(true)}>
                Add New Instructor
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-classes">
          <Card>
            <CardHeader>
              <CardTitle>Live Class Scheduling</CardTitle>
              <CardDescription>Schedule and manage live classes (requires admin key)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Live class scheduling form will be implemented here.</p>
              <Button className="mt-4" onClick={() => setShowAdminKeyDialog(true)}>
                Schedule Live Class
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coins">
          <Card>
            <CardHeader>
              <CardTitle>Coin Management</CardTitle>
              <CardDescription>View and adjust user RDMcoin balances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-chart-1/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Coins Distributed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">124,560</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all users</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-chart-2/10 to-chart-3/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">342</div>
                    <p className="text-xs text-muted-foreground mt-1">With coin balances</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-chart-4/10 to-chart-5/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Avg. Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">364</div>
                    <p className="text-xs text-muted-foreground mt-1">Coins per user</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Top Users by Coins</h3>
                <div className="space-y-3">
                  {mockUserCoins.map((user) => (
                    <div
                      key={user.user}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.user}</p>
                        <p className="text-xs text-muted-foreground mt-1">Level {user.level}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <img
                            src="/assets/generated/rdmcoin-icon-transparent.png"
                            alt="RDMcoin"
                            className="h-5 w-5"
                          />
                          <span className="text-xl font-bold text-primary">
                            {Number(user.balance).toLocaleString()}
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="mt-2">
                          Adjust
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Coin adjustments require admin key verification. Use this feature carefully to maintain system
                  integrity.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAdminKeyDialog} onOpenChange={setShowAdminKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Key Required
            </DialogTitle>
            <DialogDescription>
              This action requires admin key verification for additional security.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Enter Admin Key</Label>
              <Input
                id="adminKey"
                type="password"
                placeholder="Enter your admin key"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyAdminKey();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleVerifyAdminKey} disabled={verifyAdminKey.isPending} className="flex-1">
                {verifyAdminKey.isPending ? 'Verifying...' : 'Verify'}
              </Button>
              <Button variant="outline" onClick={() => setShowAdminKeyDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
