import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/assets/IMG-20260115-WA0000.jpg" alt="RDM Logo" className="h-8 w-auto" />
              <span className="font-bold text-lg">RDMmaths</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering students with quality mathematics education through innovative online learning.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/courses" className="hover:text-primary transition-colors">
                  Courses
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Have questions? Reach out to us for support and inquiries.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © 2025. Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
