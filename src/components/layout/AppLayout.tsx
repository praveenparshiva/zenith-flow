import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { FloatingActionButton } from './FloatingActionButton';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-22 overflow-y-auto">
        <div className="animate-page-enter">
          {children}
        </div>
      </main>
      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}
