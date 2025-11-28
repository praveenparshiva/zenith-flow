import { useMemo } from 'react';
import { useAppTasks, useAppHabits } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type ChartType = 'tasks' | 'habits';

interface WeeklyChartProps {
  type: ChartType;
}

export function WeeklyChart({ type }: WeeklyChartProps) {
  const { tasks } = useAppTasks();
  const { habits } = useAppHabits();

  const data = useMemo(() => {
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      // Count completed tasks for this day
      const tasksCompleted = tasks.filter(t => 
        t.completedAt && t.completedAt.startsWith(dayStr)
      ).length;

      // Count habit completions for this day
      const habitsCompleted = habits.reduce((count, habit) => 
        count + (habit.completions.includes(dayStr) ? 1 : 0), 0
      );

      weekData.push({
        date: date.toLocaleDateString('en', { weekday: 'short' }),
        fullDate: dayStr,
        tasks: tasksCompleted,
        habits: habitsCompleted,
      });
    }
    
    return weekData;
  }, [tasks, habits]);

  const config = {
    tasks: {
      title: 'Tasks Completed',
      dataKey: 'tasks',
      color: 'hsl(var(--chart-2))',
      formatter: (value: number) => `${value} tasks`,
    },
    habits: {
      title: 'Habits Completed',
      dataKey: 'habits',
      color: 'hsl(var(--chart-3))',
      formatter: (value: number) => `${value} habits`,
    },
  };

  const chartConfig = config[type];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{chartConfig.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                hide 
              />
              <Tooltip 
                formatter={(value: number) => chartConfig.formatter(value)}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar 
                dataKey={chartConfig.dataKey} 
                fill={chartConfig.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
