'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Task } from '@/types';
import { getSuggestion } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';

interface TaskFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddTask: (data: Omit<Task, 'id' | 'completed' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (data: Omit<Task, 'userId' | 'createdAt' | 'updatedAt'>) => void;
  task: Task | null;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
});

type Suggestion = {
  suggestedCompletionTime: string;
  reasoning: string;
};

export function TaskForm({ isOpen, setIsOpen, onAddTask, onUpdateTask, task }: TaskFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });
  
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? '',
      });
      if (task.suggestedTime && task.reasoning) {
        setSuggestion({
          suggestedCompletionTime: task.suggestedTime,
          reasoning: task.reasoning,
        });
      } else {
        setSuggestion(null);
      }
    } else {
      form.reset({ title: '', description: '' });
      setSuggestion(null);
    }
     if (!isOpen) {
      setSuggestion(null);
    }
  }, [task, isOpen, form]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
        if (task) {
            onUpdateTask({
                id: task.id,
                completed: task.completed,
                ...values,
                description: values.description || null,
                suggestedTime: suggestion?.suggestedCompletionTime || null,
                reasoning: suggestion?.reasoning || null,
            });
        } else {
            onAddTask({
                ...values,
                description: values.description || null,
                suggestedTime: suggestion?.suggestedCompletionTime || null,
                reasoning: suggestion?.reasoning || null,
            });
        }
    } catch (error) {
        console.error("Failed to submit form", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "There was an error submitting your task.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleGetSuggestion = async () => {
    const { title, description } = form.getValues();
    if (!title) {
      form.setError("title", { type: "manual", message: "Please enter a title to get a suggestion." });
      return;
    }
    
    setIsAISuggesting(true);
    setSuggestion(null);
    try {
      const result = await getSuggestion(title, description || '');
      setSuggestion(result);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: error.message || 'Could not retrieve a suggestion.',
      });
    } finally {
      setIsAISuggesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add a new task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update the details of your task.' : 'What do you need to get done?'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Schedule dentist appointment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Call Dr. Smith's office for a check-up, preferably on a weekday morning."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <Button type="button" variant="outline" className="w-full" onClick={handleGetSuggestion} disabled={isAISuggesting}>
                {isAISuggesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BrainCircuit className="mr-2 h-4 w-4" />
                )}
                Suggest Optimal Time
              </Button>
              <AnimatePresence>
                {suggestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-secondary/50">
                      <CardContent className="p-4 text-sm">
                        <p className="font-semibold text-primary-foreground">
                          Suggested Time: <span className="font-normal text-foreground">{suggestion.suggestedCompletionTime}</span>
                        </p>
                        <p className="font-semibold text-primary-foreground mt-2">
                          Reasoning: <span className="font-normal text-foreground">{suggestion.reasoning}</span>
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {task ? 'Save Changes' : 'Add Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
