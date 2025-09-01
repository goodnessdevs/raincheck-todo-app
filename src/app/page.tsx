'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskItem } from '@/components/task-item';
import { TaskForm } from '@/components/task-form';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design landing page mockup',
    description: 'Create a high-fidelity mockup in Figma for the new landing page, focusing on a clean and modern aesthetic.',
    completed: false,
  },
  {
    id: '2',
    title: 'Develop user authentication',
    description: 'Implement email/password and social login using NextAuth.js.',
    completed: false,
  },
  {
    id: '3',
    title: 'Weekly team sync',
    description: 'Discuss project progress and plan for the next sprint.',
    completed: true,
  },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
    setMounted(true);
  }, []);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
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
                <Button onClick={openNewTaskForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
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
          </div>
        </main>
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
