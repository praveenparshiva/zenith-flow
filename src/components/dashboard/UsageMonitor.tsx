import { useAppScreenTime, useAppSettings } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Smartphone, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UsageMonitor() {
  const { todayMinutes, formatMinutes, getWeeklyData, checkLimits } = useAppScreenTime();
  const { settings } = useAppSettings();

  const weeklyData = getWeeklyData();
  const limits = checkLimits(settings.screenTimeLimit);
  
  // Calculate weekly average
  const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
  const weeklyAverage = Math.round(weeklyTotal / 7);
  
  // Calculate trend (compare today vs weekly average)
  const trend = todayMinutes - weeklyAverage;
  const trendPercentage = weeklyAverage > 0 ? Math.round((trend / weeklyAverage) * 100) : 0;
  const isUp = trend > 0;

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), settings.screenTimeLimit);

  return (
    <Card className={cn(
      'overflow-hidden',
      limits.exceeded && 'ring-2 ring-destructive/50'
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Usage Today
          {limits.exceeded && (
            <AlertTriangle className="h-4 w-4 text-destructive ml-auto animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main time display */}
        <div className="flex items-end justify-between">
          <div>
            <p className={cn(
              'text-4xl font-bold tracking-tight',
              limits.exceeded ? 'text-destructive' : 'text-foreground'
            )}>
              {formatMinutes(todayMinutes)}
            </p>
            <p className="text-sm text-muted-foreground">
              of {formatMinutes(settings.screenTimeLimit)} limit
            </p>
          </div>
          
          {/* Trend indicator */}
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
            isUp ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
          )}>
            {isUp ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(trendPercentage)}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress 
            value={limits.percentage} 
            className={cn(
              'h-3 rounded-full',
              limits.exceeded && '[&>div]:bg-destructive'
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(limits.percentage)}% used</span>
            {!limits.exceeded && (
              <span>{formatMinutes(limits.remaining)} left</span>
            )}
          </div>
        </div>

        {/* Weekly chart */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            This Week
          </p>
          <div className="flex items-end justify-between h-20 gap-1.5">
            {weeklyData.map((day, i) => {
              const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
              const isToday = i === weeklyData.length - 1;
              const exceedsLimit = day.minutes > settings.screenTimeLimit;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center h-14">
                    <div
                      className={cn(
                        'w-full max-w-[24px] rounded-t-md transition-all duration-500',
                        isToday 
                          ? exceedsLimit 
                            ? 'bg-destructive' 
                            : 'bg-primary shadow-glow-sm'
                          : exceedsLimit
                            ? 'bg-destructive/50'
                            : 'bg-muted-foreground/30'
                      )}
                      style={{ 
                        height: `${Math.max(height, 8)}%`,
                      }}
                    />
                  </div>
                  <span className={cn(
                    'text-2xs',
                    isToday ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}>
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Weekly summary */}
          <div className="flex justify-between mt-3 pt-3 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{formatMinutes(weeklyTotal)}</p>
              <p className="text-2xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{formatMinutes(weeklyAverage)}</p>
              <p className="text-2xs text-muted-foreground">Daily Avg</p>
            </div>
            <div className="text-center">
              <p className={cn(
                'text-lg font-semibold',
                limits.exceeded ? 'text-destructive' : 'text-success'
              )}>
                {limits.exceeded ? 'Over' : 'Under'}
              </p>
              <p className="text-2xs text-muted-foreground">Limit</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
