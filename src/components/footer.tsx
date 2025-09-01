import { Github, Linkedin, Instagram } from 'lucide-react';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} RainCheck. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
