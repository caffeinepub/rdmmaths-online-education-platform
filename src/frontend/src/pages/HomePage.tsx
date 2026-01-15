import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Video, Users, Award, ArrowRight } from 'lucide-react';
import { useGetAllCourses } from '../hooks/useQueries';

export default function HomePage() {
  const { data: courses = [] } = useGetAllCourses();
  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-chart-1/5 to-chart-2/5">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <img src="/assets/IMG-20260115-WA0000.jpg" alt="" className="w-96 h-auto" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex justify-center mb-6">
              <img src="/assets/IMG-20260115-WA0000.jpg" alt="RDM Logo" className="h-24 w-auto" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
              Master Mathematics with RDMmaths
            </h1>
            <p className="text-xl text-muted-foreground">
              Join thousands of students learning mathematics through expert-led courses, live classes, and interactive
              content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/courses">
                  Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RDMmaths?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Comprehensive Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access a wide range of mathematics courses from basic to advanced levels.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-chart-1 mb-2" />
                <CardTitle>Video Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Learn at your own pace with high-quality video content and tutorials.</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-chart-2 mb-2" />
                <CardTitle>Live Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Attend exclusive live sessions with expert instructors for paid courses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-chart-3 mb-2" />
                <CardTitle>Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Monitor your learning journey with detailed progress tracking.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Featured Courses</h2>
              <Button asChild variant="outline">
                <Link to="/courses">View All Courses</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center">
                    <img
                      src="/assets/generated/course-placeholder.png"
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {course.category}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {course.isFree ? 'FREE' : `$${(Number(course.price) / 100).toFixed(2)}`}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to="/courses/$courseId" params={{ courseId: course.id }}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-chart-1">
        <div className="container text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg mb-8 opacity-90">Join RDMmaths today and unlock your mathematical potential.</p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/courses">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
