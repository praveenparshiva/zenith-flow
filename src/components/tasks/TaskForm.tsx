import { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority, Alarm } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Bell, Trash2 } from 'lucide-react';
import { generateId } from '@/lib/storage';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt' | 'timeSpent' | 'pomodoroSessions'>) => void;
  onCancel: () => void;
}

const categories: { value: TaskCategory; label: string; emoji: string }[] = [
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'personal', label: 'Personal', emoji: '👤' },
  { value: 'health', label: 'Health', emoji: '💪' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'other', label: 'Other', emoji: '📌' },
];

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [name, setName] = useState(task?.name || '');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'personal');
  const [notes, setNotes] = useState(task?.notes || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [isDaily, setIsDaily] = useState(task?.isDaily ?? true);
  const [alarms, setAlarms] = useState<Alarm[]>(task?.alarms || []);
  const [newAlarmTime, setNewAlarmTime] = useState('09:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      category,
      notes: notes.trim(),
      priority,
      isDaily,
      alarms,
    });
  };

  const addAlarm = () => {
    const newAlarm: Alarm = {
      id: generateId(),
      time: newAlarmTime,
      enabled: true,
      repeating: isDaily,
    };
    setAlarms(prev => [...prev, newAlarm]);
  };

  const removeAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const toggleAlarmEnabled = (id: string) => {
    setAlarms(prev => prev.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Task Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What do you need to do?"
          autoFocus
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              type="button"
              variant={category === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.value)}
            >
              {cat.emoji} {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Daily/Permanent Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="isDaily">Daily Task</Label>
          <p className="text-xs text-muted-foreground">
            {isDaily ? 'Resets every day' : 'One-time task'}
          </p>
        </div>
        <Switch
          id="isDaily"
          checked={isDaily}
          onCheckedChange={setIsDaily}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional details..."
          rows={3}
        />
      </div>

      {/* Alarms */}
      <div className="space-y-3">
        <Label>Alarms</Label>
        
        {/* Existing alarms */}
        {alarms.length > 0 && (
          <div className="space-y-2">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Bell className={`h-4 w-4 ${alarm.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={alarm.enabled ? '' : 'text-muted-foreground line-through'}>
                    {alarm.time}
                  </span>
                  {alarm.repeating && (
                    <Badge variant="secondary" className="text-xs">Repeating</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alarm.enabled}
                    onCheckedChange={() => toggleAlarmEnabled(alarm.id)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeAlarm(alarm.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new alarm */}
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={newAlarmTime}
            onChange={(e) => setNewAlarmTime(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addAlarm}>
            <Plus className="h-4 w-4 mr-1" />
            Add Alarm
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="gradient" className="flex-1">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
