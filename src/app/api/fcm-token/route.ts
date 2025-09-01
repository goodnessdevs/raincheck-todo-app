import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ message: 'Token is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user && !user.fcmTokens.includes(token)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          fcmTokens: {
            push: token,
          },
        },
      });
    }
    
    return NextResponse.json({ message: 'Token saved' }, { status: 200 });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
