import { useAppScreenTime, useAppSettings } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScreenTimeWidget() {
  const { todayMinutes, formatMinutes, checkLimits, getWeeklyData } = useAppScreenTime();
  const { settings } = useAppSettings();

  const limits = checkLimits(settings.screenTimeLimit);
  const weeklyData = getWeeklyData();

  const maxWeeklyMinutes = Math.max(...weeklyData.map(d => d.minutes), 60);

  return (
    <Card className={cn(
      limits.exceeded && 'border-destructive/50 bg-destructive/5'
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Screen Time
          {limits.exceeded && (
            <AlertTriangle className="h-4 w-4 text-destructive ml-auto" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's time */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold">{formatMinutes(todayMinutes)}</span>
            <span className="text-sm text-muted-foreground">
              / {formatMinutes(settings.screenTimeLimit)}
            </span>
          </div>
          <Progress 
            value={limits.percentage} 
            className={cn(
              'h-2',
              limits.exceeded && 'bg-destructive/20'
            )}
          />
          {limits.remaining > 0 && !limits.exceeded && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatMinutes(limits.remaining)} remaining
            </p>
          )}
        </div>

        {/* Weekly Chart */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">This Week</p>
          <div className="flex items-end justify-between h-16 gap-1">
            {weeklyData.map((day, i) => {
              const height = (day.minutes / maxWeeklyMinutes) * 100;
              const isToday = i === weeklyData.length - 1;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-12">
                    <div
                      className={cn(
                        'w-full max-w-[20px] rounded-t transition-all',
                        isToday ? 'bg-primary' : 'bg-muted-foreground/30'
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-2xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
