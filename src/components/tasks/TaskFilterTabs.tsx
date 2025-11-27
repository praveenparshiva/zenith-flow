import { cn } from '@/lib/utils';

export type TaskFilter = 'all' | 'active' | 'done';

interface TaskFilterTabsProps {
  filter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  counts: {
    all: number;
    active: number;
    done: number;
  };
}

export function TaskFilterTabs({ filter, onChange, counts }: TaskFilterTabsProps) {
  const tabs: { value: TaskFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'active', label: 'Active', count: counts.active },
    { value: 'done', label: 'Done', count: counts.done },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            'flex items-center justify-center gap-1.5',
            filter === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded-full',
            filter === tab.value
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
