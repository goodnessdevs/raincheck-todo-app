'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, LogIn, MessageSquare, ListTodo } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskItem } from '@/components/task-item';
import { TaskForm } from '@/components/task-form';
import { Footer } from '@/components/footer';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/app-header';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setMounted(true);
    if (status === 'authenticated') {
      fetch('/api/tasks')
        .then(res => res.json())
        .then(data => setTasks(data));
    }
  }, [status]);

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
    setIsFormOpen(false);
    toast({
      title: 'Task Added!',
      description: `"${newTask.title}" has been added to your list.`,
    });
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
    setIsFormOpen(false);
     toast({
      title: 'Task Updated!',
      description: `"${result.title}" has been successfully updated.`,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    const deletedTask = tasks.find(t => t.id === taskId);
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

    const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };

    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
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

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen"></div>;
  }
  
  return (
    <>
      <audio ref={audioRef} src="/sounds/complete.mp3" preload="auto"></audio>
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <AppHeader page="tasks" />

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {status === 'authenticated' ? (
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
                      <AnimatePresence>
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
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/20 shadow-sm">
                     <CardHeader>
                      <CardTitle className="text-2xl">Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AnimatePresence>
                        {completedTasks.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onEdit={openEditTaskForm}
                            onDelete={handleDeleteTask}
                            onToggleComplete={handleToggleComplete}
                          />
                        ))}
                      </AnimatePresence>
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
             ) : (
              <div className="text-center py-20">
                 <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                  >
                  <h1 className="text-5xl font-extrabold tracking-tight">Welcome to <span className="text-primary">RainCheck</span></h1>
                  <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">Your smart to-do list for staying organized and productive. Please sign in to manage your tasks.</p>
                  <Link href="/login" className="mt-10 inline-block">
                    <Button size="lg" className="text-lg py-7 px-10">
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign In with Google
                    </Button>
                  </Link>
                </motion.div>
              </div>
             )}
        </main>
        <Footer />
      </div>

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
