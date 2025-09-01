'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, LogIn, LogOut } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskItem } from '@/components/task-item';
import { TaskForm } from '@/components/task-form';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
    if (status === 'authenticated') {
      fetch('/api/tasks')
        .then(res => res.json())
        .then(data => setTasks(data));
    }
  }, [status]);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const newTask = await response.json();
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
    });
    const result = await response.json();
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === result.id ? result : task))
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
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
    return null;
  }
  
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Logo />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {status === 'authenticated' ? (
                  <>
                    <Button onClick={openNewTaskForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? ''} />
                            <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {session.user?.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Link href="/login">
                    <Button>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
             {status === 'authenticated' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Your Tasks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <section>
                      <h3 className="text-lg font-medium mb-4 text-foreground/80">Pending</h3>
                      <div className="space-y-3">
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
                              className="text-muted-foreground text-center py-4"
                            >
                              No pending tasks. Add one to get started!
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-lg font-medium mb-4 text-foreground/80">Completed</h3>
                      <div className="space-y-3">
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
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </motion.div>
             ) : (
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold tracking-tight">Welcome to RainCheck</h1>
                <p className="mt-4 text-lg text-muted-foreground">Please sign in to manage your tasks.</p>
              </div>
             )}
          </div>
        </main>
        <Footer />
      </div>

      <TaskForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        task={editingTask}
      />
    </>
  );
}
