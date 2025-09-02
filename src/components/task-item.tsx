'use client';

import { motion } from 'framer-motion';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { format, isValid } from 'date-fns';

import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
}

export function TaskItem({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  const reminderDate = task.suggestedTime ? new Date(task.suggestedTime) : null;
  const isDateValid = reminderDate && isValid(reminderDate);


  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className={cn(
        'rounded-lg border p-4 flex items-start gap-4 transition-all duration-300',
        task.completed ? 'bg-muted/50 border-dashed' : 'bg-card shadow-sm'
        )}>
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1 h-5 w-5 rounded-full"
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          <div className="flex-1 grid gap-1.5">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'font-medium text-lg cursor-pointer',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </label>
            {task.description && (
              <p
                className={cn(
                  'text-sm text-muted-foreground',
                  task.completed && 'line-through'
                )}
              >
                {task.description}
              </p>
            )}
             {isDateValid && reminderDate && (
              <div className="flex items-center text-xs text-primary pt-1 cursor-default font-semibold">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>{format(reminderDate, "EEE, MMM d 'at' p")}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onEdit(task)}
              aria-label={`Edit task "${task.title}"`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  aria-label={`Delete task "${task.title}"`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your task.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(task.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
    </motion.div>
  );
}
