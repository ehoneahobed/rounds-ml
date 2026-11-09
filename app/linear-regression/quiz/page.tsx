import type { Metadata } from "next";
import { QuizRunner } from "@/components/quiz-runner";

export const metadata: Metadata = {
  title: "Knowledge check",
};

export default function LinearRegressionQuizPage() {
  return <QuizRunner />;
}
