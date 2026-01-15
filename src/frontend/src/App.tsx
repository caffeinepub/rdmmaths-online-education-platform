import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import DashboardPage from './pages/DashboardPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CoinWalletPage from './pages/CoinWalletPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

const rootRoute = createRootRoute({
  component: RootLayout
});

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
});

const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courses',
  component: CoursesPage
});

const courseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courses/$courseId',
  component: CourseDetailPage
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage
});

const coinsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coins',
  component: CoinWalletPage
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: LeaderboardPage
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-login',
  component: AdminLoginPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  coursesRoute,
  courseDetailRoute,
  dashboardRoute,
  coinsRoute,
  leaderboardRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminRoute,
  adminLoginRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </ThemeProvider>
  );
}
