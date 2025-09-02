'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, User, Bot } from 'lucide-react';

import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { aiAssistant } from '@/ai/flows/ai-assistant-flow';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type ChatMessage = {
  role: 'user' | 'model';
  content: { text: string }[];
};

export default function AIAssistantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiAssistant({
        history: messages,
        message: input,
      });
      const modelMessage: ChatMessage = { role: 'model', content: [{ text: response }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: [{ text: 'Sorry, something went wrong. Please try again.' }],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center min-h-screen"></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <AppHeader page="ai-assistant" />
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-[75vh] bg-card border rounded-lg shadow-lg"
        >
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
             <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                 <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center h-full text-center text-muted-foreground"
                 >
                    <Bot size={48} className="mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">RainCheck AI Assistant</h2>
                    <p className="mt-2">How can I help you be more productive today?</p>
                 </motion.div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'flex items-start gap-4',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'model' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-md p-3 rounded-lg',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content[0].text}</p>
                    </div>
                     {msg.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback><User size={18} /></AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))
              )}
               {isLoading && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start gap-4">
                        <Avatar className="w-8 h-8">
                           <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18} /></AvatarFallback>
                        </Avatar>
                        <div className="bg-muted p-3 rounded-lg flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    </div>
                 </motion.div>
                )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <CardContent className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything about your tasks or productivity..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardContent>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
