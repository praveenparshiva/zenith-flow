import { ReactNode } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  showSettings?: boolean;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  action, 
  showSettings = true,
  className 
}: PageHeaderProps) {
  return (
    <header className={cn(
      'sticky top-0 z-40',
      'bg-background/80 backdrop-blur-xl',
      'border-b border-border/30',
      'safe-area-inset-top',
      className
    )}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {action}
            {showSettings && (
              <Button 
                variant="ghost" 
                size="icon" 
                asChild 
                className="rounded-xl hover:bg-muted/60 h-10 w-10"
              >
                <Link to="/settings">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
