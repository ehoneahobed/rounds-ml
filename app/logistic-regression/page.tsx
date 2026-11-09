import type { Metadata } from "next";
import { LogisticRegressionHome } from "@/components/logistic-regression-home";

export const metadata: Metadata = {
  title: "Logistic regression",
};

export default function LogisticRegressionPage() {
  return <LogisticRegressionHome />;
}
