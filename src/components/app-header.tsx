'use client';

import { LogOut, MessageSquare, ListTodo } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationPermissionRequester } from '@/components/notification-permission-requester';
import { motion } from 'framer-motion';

interface AppHeaderProps {
    page: 'tasks' | 'ai-assistant';
}

export function AppHeader({ page }: AppHeaderProps) {
    const { data: session } = useSession();
    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Logo />
                <div className="flex flex-1 items-center justify-end space-x-2">
                     <nav className="hidden md:flex items-center space-x-2 mr-4">
                        <Link href="/">
                            <Button variant={page === 'tasks' ? 'secondary' : 'ghost'}>
                               <ListTodo className="mr-2 h-4 w-4"/> Tasks
                            </Button>
                        </Link>
                        <Link href="/ai-assistant">
                            <Button variant={page === 'ai-assistant' ? 'secondary' : 'ghost'}>
                                <MessageSquare className="mr-2 h-4 w-4"/> AI Assistant
                            </Button>
                        </Link>
                    </nav>
                    <ThemeToggle />
                    {session ? (
                    <>
                        <NotificationPermissionRequester />
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? ''} />
                                <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                           </motion.div>
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
                             <DropdownMenuItem asChild className="md:hidden">
                                 <Link href="/">
                                    <ListTodo className="mr-2 h-4 w-4"/> Tasks
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="md:hidden">
                                <Link href="/ai-assistant">
                                    <MessageSquare className="mr-2 h-4 w-4"/> AI Assistant
                                </Link>
                            </DropdownMenuItem>
                             <DropdownMenuSeparator className="md:hidden"/>
                            <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
