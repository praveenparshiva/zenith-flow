import { ReactNode } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showSettings?: boolean;
}

export function PageHeader({ title, subtitle, action, showSettings = true }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {showSettings && (
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
