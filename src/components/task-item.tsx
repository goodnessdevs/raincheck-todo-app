'use client';

import { motion } from 'framer-motion';
import { Edit, Trash2, Clock, BrainCircuit } from 'lucide-react';

import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Card className={cn('transition-colors', task.completed && 'bg-muted/50')}>
        <CardContent className="p-4 flex items-start gap-4">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1"
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          <div className="flex-1 grid gap-1">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'font-medium cursor-pointer',
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
            {task.suggestedTime && (
                <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center text-xs text-primary pt-1 cursor-default">
                            <Clock className="h-3 w-3 mr-1.5" />
                            <span>{task.suggestedTime}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        <div className="flex items-start gap-2 p-1">
                          <BrainCircuit className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <p><strong>AI Suggestion:</strong> {task.reasoning}</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
                </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
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
                  className="h-8 w-8 text-destructive hover:text-destructive"
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
