import { Link, useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BookOpen, LayoutDashboard, GraduationCap, Settings, Coins, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      router.navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navItems = [
    { label: 'Home', path: '/', icon: BookOpen },
    { label: 'Courses', path: '/courses', icon: GraduationCap },
    ...(isAuthenticated ? [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(isAuthenticated ? [{ label: 'My RDMcoins', path: '/coins', icon: Coins }] : []),
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: Settings }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/IMG-20260115-WA0000.jpg" alt="RDM Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              RDMmaths
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleAuth} disabled={disabled} variant={isAuthenticated ? 'outline' : 'default'}>
            {buttonText}
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
