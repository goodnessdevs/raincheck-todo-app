import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import type { Task } from '@/types';

type RouteParams = {
  params: {
    id: string;
  };
};

async function getTaskForUser(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task || task.userId !== userId) {
    return null;
  }
  return task;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const task = await getTaskForUser(params.id, session.user.id);
  if (!task) {
    return NextResponse.json({ message: 'Task not found' }, { status: 404 });
  }

  const data: Partial<Task> = await request.json();

  const updatedTask = await prisma.task.update({
    where: {
      id: params.id,
    },
    data: {
      title: data.title,
      description: data.description,
      completed: data.completed,
      suggestedTime: data.suggestedTime,
      reasoning: data.reasoning,
    },
  });

  return NextResponse.json(updatedTask);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const task = await getTaskForUser(params.id, session.user.id);
  if (!task) {
    return NextResponse.json({ message: 'Task not found' }, { status: 404 });
  }

  await prisma.task.delete({
    where: {
      id: params.id,
    },
  });

  return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
}
