
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const revalidate = 0;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  try {
    const tasks = await prisma.task.findMany({
      where: {
        completed: false,
        suggestedTime: {
          not: null,
        },
        // We'll parse suggestedTime on the backend for more robust handling
      },
      include: {
        user: {
          select: {
            fcmTokens: true,
          },
        },
      },
    });

    const notificationsToSend = [];

    for (const task of tasks) {
      if (task.suggestedTime) {
        const taskTime = new Date(task.suggestedTime);
        if (taskTime >= now && taskTime <= fiveMinutesFromNow) {
          if (task.user && task.user.fcmTokens.length > 0) {
            
            const messages = task.user.fcmTokens.map(token => ({
              token: token,
              notification: {
                title: 'Task Reminder',
                body: `Your task "${task.title}" is due soon.`,
              },
              webpush: {
                fcmOptions: {
                  link: '/', 
                },
              },
            }));

            notificationsToSend.push(...messages);
          }
        }
      }
    }

    if (notificationsToSend.length > 0) {
        const admin = getFirebaseAdmin();
        const messaging = admin.messaging();
        const response = await messaging.sendEach(notificationsToSend as any);
        
        console.log(`Successfully sent ${response.successCount} messages`);
        if (response.failureCount > 0) {
          console.log('Failed messages:', response.responses.filter(r => !r.success));
        }
    }

    return NextResponse.json({ message: 'Reminders checked', sent: notificationsToSend.length });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
