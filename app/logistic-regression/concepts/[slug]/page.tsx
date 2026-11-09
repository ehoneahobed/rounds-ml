import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConceptArticle } from "@/components/concept-article";
import { conceptBySlug, concepts } from "@/lib/content/logistic-regression/concepts";

export function generateStaticParams() {
  return concepts.map((concept) => ({ slug: concept.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const concept = conceptBySlug(slug);
  return { title: concept?.title ?? "Concept" };
}

export default async function LogisticRegressionConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concept = conceptBySlug(slug);
  if (!concept) notFound();
  return <ConceptArticle concept={concept} />;
}
