'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { TasksDashboard } from '@/components/tasks-dashboard';

export default function Home() {
  const { status } = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <AppHeader page="tasks" />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {status === 'loading' ? (
          <div className="flex items-center justify-center min-h-[60vh]"></div>
        ) : status === 'authenticated' ? (
          <TasksDashboard />
        ) : (
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <h1 className="text-5xl font-extrabold tracking-tight">
                Welcome to <span className="text-primary">RainCheck</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
                Your smart to-do list for staying organized and productive. Please sign in to manage your tasks.
              </p>
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
  );
}
