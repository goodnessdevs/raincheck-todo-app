export type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  suggestedTime: string | null;
  reasoning: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
