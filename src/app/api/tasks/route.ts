import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import type { Task } from '@/types';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const data: Omit<Task, 'id' | 'completed' | 'userId' | 'createdAt' | 'updatedAt'> = await request.json();

  const newTask = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      completed: false,
      suggestedTime: data.suggestedTime,
      reasoning: data.reasoning,
      userId: session.user.id,
    },
  });

  return NextResponse.json(newTask, { status: 201 });
}
