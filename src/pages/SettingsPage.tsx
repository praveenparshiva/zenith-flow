import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppSettings } from '@/contexts/AppContext';
import { 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Volume2, 
  Vibrate, 
  RotateCcw,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { settings, updateSettings, updateNotificationSettings, setTheme, resetSettings } = useAppSettings();

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Settings"
        subtitle="Customize your experience"
        showSettings={false}
      />

      <div className="px-4 space-y-4 pb-24">
        {/* Theme */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.theme === option.value ? 'default' : 'outline'}
                  className={cn(
                    'flex-1 flex-col h-auto py-3 gap-2',
                    settings.theme === option.value && 'gradient-primary'
                  )}
                  onClick={() => setTheme(option.value)}
                >
                  <option.icon className="h-5 w-5" />
                  <span className="text-xs">{option.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alarm Notifications</Label>
                <p className="text-xs text-muted-foreground">Task alarm reminders</p>
              </div>
              <Switch
                checked={settings.notifications.alarms}
                onCheckedChange={(checked) => updateNotificationSettings({ alarms: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Habit Reminders</Label>
                <p className="text-xs text-muted-foreground">Daily habit check-ins</p>
              </div>
              <Switch
                checked={settings.notifications.habitReminders}
                onCheckedChange={(checked) => updateNotificationSettings({ habitReminders: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Pomodoro Alerts</Label>
                <p className="text-xs text-muted-foreground">Timer completion sounds</p>
              </div>
              <Switch
                checked={settings.notifications.pomodoroAlerts}
                onCheckedChange={(checked) => updateNotificationSettings({ pomodoroAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound & Vibration */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sound & Haptics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Label>Sound</Label>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="h-4 w-4 text-muted-foreground" />
                <Label>Vibration</Label>
              </div>
              <Switch
                checked={settings.vibrationEnabled}
                onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reset */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <RotateCcw className="h-4 w-4" />
              Reset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive"
              onClick={resetSettings}
            >
              Reset All Settings
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will restore all settings to their defaults
            </p>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="font-semibold">FocusFlow</p>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground mt-2">
                Productivity & Digital Well-Being
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
