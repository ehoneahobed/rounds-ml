import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaskWorkspace } from "@/components/task-workspace";
import { taskBySlug, tasks } from "@/lib/content/tasks";

export function generateStaticParams() {
  return tasks.map((task) => ({ slug: task.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const task = taskBySlug(slug);
  return { title: task ? `Task ${task.number} · ${task.title}` : "Task" };
}

export default async function DecisionTreesTaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = taskBySlug(slug);
  if (!task) notFound();
  return <TaskWorkspace task={task} />;
}
