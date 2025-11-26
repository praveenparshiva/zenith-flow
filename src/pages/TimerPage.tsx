import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SlideUpModal } from '@/components/common/SlideUpModal';
import { Settings2 } from 'lucide-react';
import { useAppTimer, useAppTasks } from '@/contexts/AppContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TimerPage() {
  const { settings, updateSettings, state, start } = useAppTimer();
  const { pendingTasks } = useAppTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSelectTask = (taskId: string) => {
    if (!state.isRunning) {
      start(taskId);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Pomodoro Timer"
        subtitle="Focus and be productive"
        action={
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        }
        showSettings={false}
      />

      <div className="p-4 space-y-6">
        {/* Timer Display */}
        <TimerDisplay />

        {/* Task Selection */}
        {!state.isRunning && pendingTasks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Select a Task</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleSelectTask} value={state.currentTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a task to work on" />
                </SelectTrigger>
                <SelectContent>
                  {pendingTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">💡 Pomodoro Technique</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Work for 25 minutes with full focus</p>
            <p>2. Take a 5-minute break</p>
            <p>3. After 4 sessions, take a longer 15-minute break</p>
            <p>4. Repeat and track your progress!</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal */}
      <SlideUpModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        title="Timer Settings"
        description="Customize your Pomodoro timer"
      >
        <div className="space-y-6">
          {/* Duration Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Focus Duration (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.pomodoroDuration}
                onChange={(e) => updateSettings({ 
                  pomodoroDuration: parseInt(e.target.value) || 25 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Short Break (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={settings.shortBreakDuration}
                onChange={(e) => updateSettings({ 
                  shortBreakDuration: parseInt(e.target.value) || 5 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Long Break (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.longBreakDuration}
                onChange={(e) => updateSettings({ 
                  longBreakDuration: parseInt(e.target.value) || 15 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Sessions before Long Break</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={settings.longBreakInterval}
                onChange={(e) => updateSettings({ 
                  longBreakInterval: parseInt(e.target.value) || 4 
                })}
              />
            </div>
          </div>

          {/* Auto-start Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-start Breaks</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically start breaks after focus sessions
                </p>
              </div>
              <Switch
                checked={settings.autoStartBreaks}
                onCheckedChange={(checked) => updateSettings({ 
                  autoStartBreaks: checked 
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-start Pomodoros</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically start focus sessions after breaks
                </p>
              </div>
              <Switch
                checked={settings.autoStartPomodoros}
                onCheckedChange={(checked) => updateSettings({ 
                  autoStartPomodoros: checked 
                })}
              />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsSettingsOpen(false)}
          >
            Done
          </Button>
        </div>
      </SlideUpModal>
    </div>
  );
}
