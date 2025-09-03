'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskItem } from '@/components/task-item';
import { TaskForm } from '@/components/task-form';
import { useToast } from '@/hooks/use-toast';

export function TasksDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);
  
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const newTask = await response.json();
    setTasks(prevTasks => [newTask, ...prevTasks]);
    toast({
      title: 'Task Added!',
      description: `"${newTask.title}" has been added to your list.`,
    });
    setIsFormOpen(false);
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`/api/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    const result = await response.json();
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === result.id ? result : task))
    );
     toast({
      title: 'Task Updated!',
      description: `"${result.title}" has been successfully updated.`,
    });
    setIsFormOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    const deletedTask = tasks.find(t => t.id === taskId);
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    toast({
      variant: 'destructive',
      title: 'Task Deleted',
      description: `"${deletedTask?.title}" has been removed.`,
    });
  };

  const handleToggleComplete = async (taskId: string) => {
    const taskToToggle = tasks.find(task => task.id === taskId);
    if (!taskToToggle) return;

    const updatedTaskData = { ...taskToToggle, completed: !taskToToggle.completed };

    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTaskData),
    });
    const result = await response.json();

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? result : task
      )
    );

    if (result.completed) {
      playSound();
      toast({
        title: 'Task Completed!',
        description: `Great job on finishing "${result.title}"!`,
      });
    }
  };

  const openNewTaskForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditTaskForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const { pendingTasks, completedTasks } = useMemo(() => {
    const pending: Task[] = [];
    const completed: Task[] = [];
    tasks.forEach(task => {
      if (task.completed) {
        completed.push(task);
      } else {
        pending.push(task);
      }
    });
    return { pendingTasks: pending, completedTasks: completed };
  }, [tasks]);

  return (
    <>
      <audio ref={audioRef} src="/sounds/complete.mp3" preload="auto"></audio>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Your Tasks</h1>
          <Button onClick={openNewTaskForm} size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Add New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Pending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onEdit={openEditTaskForm}
                      onDelete={handleDeleteTask}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted-foreground text-center py-10"
                  >
                    No pending tasks. Add one to get started!
                  </motion.p>
                )}
            </CardContent>
          </Card>
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Completed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {completedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={openEditTaskForm}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              {completedTasks.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground text-center py-10"
                >
                  No completed tasks yet.
                </motion.p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
      <TaskForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        task={editingTask}
      />
    </>
  );
}
