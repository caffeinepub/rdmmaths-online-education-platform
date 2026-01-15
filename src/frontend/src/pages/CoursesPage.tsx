import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetAllCourses } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
import type { Course } from '../backend';

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useGetAllCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category));
    return Array.from(cats);
  }, [courses]);

  const difficulties = useMemo(() => {
    const diffs = new Set(courses.map((c) => c.difficulty));
    return Array.from(diffs);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || course.difficulty === difficultyFilter;
      const matchesPrice =
        priceFilter === 'all' || (priceFilter === 'free' && course.isFree) || (priceFilter === 'paid' && !course.isFree);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesPrice;
    });
  }, [courses, searchQuery, categoryFilter, difficultyFilter, priceFilter]);

  const freeCourses = filteredCourses.filter((c) => c.isFree);
  const paidCourses = filteredCourses.filter((c) => !c.isFree);

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center">
        <img src="/assets/generated/course-placeholder.png" alt={course.title} className="w-full h-full object-cover" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
            {course.category}
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">{course.difficulty}</span>
        </div>
        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">By {course.instructor}</span>
          <span className="text-lg font-bold text-primary">
            {course.isFree ? 'FREE' : `$${(Number(course.price) / 100).toFixed(2)}`}
          </span>
        </div>
        <Button asChild className="w-full">
          <Link to="/courses/$courseId" params={{ courseId: course.id }}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
        <p className="text-muted-foreground">
          Discover our comprehensive collection of mathematics courses designed for all skill levels.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map((diff) => (
                <SelectItem key={diff} value={diff}>
                  {diff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
          <TabsTrigger value="free">Free ({freeCourses.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="free" className="space-y-6">
          {freeCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No free courses available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-6">
          {paidCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No paid courses available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
