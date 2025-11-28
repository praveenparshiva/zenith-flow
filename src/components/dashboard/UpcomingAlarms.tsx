import { useAppTasks } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UpcomingAlarms() {
  const { tasks } = useAppTasks();

  // Get all enabled alarms with their task info
  const upcomingAlarms = tasks
    .flatMap(task => 
      task.alarms
        .filter(alarm => alarm.enabled && !task.completed)
        .map(alarm => ({
          ...alarm,
          taskId: task.id,
          taskName: task.name,
          taskCategory: task.category,
        }))
    )
    .sort((a, b) => {
      const [aHour, aMin] = a.time.split(':').map(Number);
      const [bHour, bMin] = b.time.split(':').map(Number);
      return (aHour * 60 + aMin) - (bHour * 60 + bMin);
    })
    .slice(0, 4);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isUpcoming = (time: string) => {
    const [hour, min] = time.split(':').map(Number);
    const alarmMinutes = hour * 60 + min;
    return alarmMinutes > currentMinutes;
  };

  const formatTime = (time: string) => {
    const [hour, min] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`;
  };

  if (upcomingAlarms.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Upcoming Alarms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <BellOff className="h-6 w-6 text-muted-foreground/50 mb-1.5" />
            <p className="text-sm text-muted-foreground">No alarms scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Upcoming Alarms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcomingAlarms.map((alarm) => (
          <div
            key={`${alarm.taskId}-${alarm.id}`}
            className={cn(
              'flex items-center justify-between p-2.5 rounded-lg transition-all',
              isUpcoming(alarm.time) ? 'bg-muted' : 'bg-muted/50 opacity-60'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Bell className={cn(
                'h-3.5 w-3.5 flex-shrink-0',
                isUpcoming(alarm.time) ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{alarm.taskName}</p>
                {alarm.repeating && (
                  <Badge variant="secondary" className="text-2xs mt-0.5 h-4">
                    Daily
                  </Badge>
                )}
              </div>
            </div>
            <span className={cn(
              'text-sm font-medium tabular-nums flex-shrink-0 ml-2',
              isUpcoming(alarm.time) ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {formatTime(alarm.time)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
