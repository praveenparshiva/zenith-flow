import { Home, CheckSquare, Timer, Target, BarChart3 } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/timer', icon: Timer, label: 'Timer' },
  { to: '/habits', icon: Target, label: 'Habits' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
      <div className="bg-card/95 backdrop-blur-xl border-t border-border/40 shadow-soft-lg">
        <div className="flex items-center justify-around h-18 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl',
                  'transition-all duration-300 min-w-[60px]',
                  'touch-manipulation active:scale-95',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className={cn(
                  'relative p-2 rounded-xl transition-all duration-300',
                  isActive && 'bg-primary/10'
                )}>
                  <item.icon className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isActive && 'scale-110'
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/15 rounded-xl blur-lg -z-10" />
                  )}
                </div>
                <span className={cn(
                  'text-2xs font-medium transition-colors duration-300',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
