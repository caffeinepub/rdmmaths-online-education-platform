import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useVerifyAdminKey, useSetAdminKey, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, AlertCircle, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const verifyAdminKey = useVerifyAdminKey();
  const setAdminKey = useSetAdminKey();

  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [isSettingKey, setIsSettingKey] = useState(false);
  const [keyError, setKeyError] = useState('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleAdminKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError('');

    if (!adminKeyInput.trim()) {
      setKeyError('Please enter an admin key');
      return;
    }

    try {
      const isValid = await verifyAdminKey.mutateAsync(adminKeyInput);
      if (isValid) {
        navigate({ to: '/admin' });
      } else {
        setKeyError('Invalid admin key. Please try again.');
      }
    } catch (error: any) {
      if (error.message?.includes('Admin key not configured')) {
        setIsSettingKey(true);
        setKeyError('');
      } else {
        setKeyError(error.message || 'Failed to verify admin key');
      }
    }
  };

  const handleSetAdminKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError('');

    if (!adminKeyInput.trim()) {
      setKeyError('Please enter an admin key');
      return;
    }

    try {
      await setAdminKey.mutateAsync(adminKeyInput);
      navigate({ to: '/admin' });
    } catch (error: any) {
      setKeyError(error.message || 'Failed to set admin key');
    }
  };

  if (adminLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Access Required</CardTitle>
              <CardDescription>Please log in to access the admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You must be logged in with an admin account to access this page.
                </AlertDescription>
              </Alert>
              <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full" size="lg">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <Lock className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Access Denied</CardTitle>
              <CardDescription>You don't have permission to access the admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This page is restricted to administrators only. Please contact the system administrator if you
                  believe you should have access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isSettingKey ? 'Set Admin Key' : 'Admin Login'}
            </CardTitle>
            <CardDescription>
              {isSettingKey
                ? 'No admin key is configured. Please set a secure admin key to access the admin panel.'
                : 'Enter your admin key to access the admin dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSettingKey ? handleSetAdminKey : handleAdminKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminKey">Admin Key 🔐</Label>
                <Input
                  id="adminKey"
                  type="password"
                  placeholder="Enter your admin key"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  className="text-base"
                  autoFocus
                />
              </div>

              {keyError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{keyError}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  {isSettingKey
                    ? 'This key will be required for all administrative operations. Keep it secure.'
                    : 'This special key is required to prevent unauthorized access to administrative functions.'}
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!adminKeyInput.trim() || verifyAdminKey.isPending || setAdminKey.isPending}
              >
                {verifyAdminKey.isPending || setAdminKey.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSettingKey ? 'Setting Key...' : 'Verifying...'}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {isSettingKey ? 'Set Admin Key' : 'Access Admin Dashboard'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
