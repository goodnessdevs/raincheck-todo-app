'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseApp from '@/lib/firebase';
import { useSession } from 'next-auth/react';
import { Bell, BellRing } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function NotificationPermissionRequester() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging = getMessaging(firebaseApp);

      // Handle foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received.', payload);
        toast({
          title: payload.notification?.title,
          description: payload.notification?.body,
        });
      });

      return () => unsubscribe();
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.error('This browser does not support desktop notification');
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'This browser does not support desktop notifications.',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      await saveTokenToDb();
    } else {
      toast({
        variant: 'destructive',
        title: 'Notification Permission Denied',
        description: 'You will not receive task reminders.',
      });
    }
  };

  const saveTokenToDb = async () => {
    try {
      const messaging = getMessaging(firebaseApp);
      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.VAPID_PUBLIC_KEY, // Replace with your VAPID public key
      });

      if (fcmToken) {
        await fetch('/api/fcm-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: fcmToken }),
        });
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive task reminders.',
        });
      }
    } catch (error) {
      console.error('Error getting and saving FCM token:', error);
      toast({
        variant: 'destructive',
        title: 'Error Enabling Notifications',
        description: 'Could not save settings. Please try again.',
      });
    }
  };

  if (!session) return null;
  if (notificationPermission === 'granted') {
    return (
       <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" disabled>
                <BellRing className="h-4 w-4 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications are enabled</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={requestPermission}>
            <Bell className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enable notifications</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
