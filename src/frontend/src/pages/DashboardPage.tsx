import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyEnrolledCourses, useGetUpcomingLiveClasses, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@tanstack/react-router';
import { BookOpen, Calendar, Video, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: enrolledCourses = [] } = useGetMyEnrolledCourses();
  const { data: liveClasses = [] } = useGetUpcomingLiveClasses();
  const { data: userProfile } = useGetCallerUserProfile();

  if (!identity) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Please login to view your dashboard</p>
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
        <h1 className="text-4xl font-bold mb-2">Welcome back, {userProfile?.name || 'Student'}!</h1>
        <p className="text-muted-foreground">Track your progress and continue your learning journey.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Live Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveClasses.length}</div>
            <p className="text-xs text-muted-foreground">In the next 2 weeks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrolledCourses.length > 0 ? Math.round((enrolledCourses.length / 10) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="live-classes">Live Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center">
                    <img
                      src="/assets/generated/course-placeholder.png"
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>{course.videos.length} videos</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{Number(course.duration)} min</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/courses/$courseId" params={{ courseId: course.id }}>
                        Continue Learning
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="live-classes" className="space-y-6">
          {liveClasses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming live classes scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {liveClasses.map((liveClass) => (
                <Card key={liveClass.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{liveClass.title}</CardTitle>
                        <CardDescription className="mt-2">{liveClass.description}</CardDescription>
                      </div>
                      <img
                        src="/assets/generated/live-class-icon-transparent.png"
                        alt="Live"
                        className="h-12 w-12 shrink-0"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(Number(liveClass.startTime) / 1000000), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(Number(liveClass.startTime) / 1000000), 'p')} ({Number(liveClass.duration)}{' '}
                            min)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>Instructor: {liveClass.instructor}</span>
                        </div>
                      </div>
                      <Button>Join Class</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
