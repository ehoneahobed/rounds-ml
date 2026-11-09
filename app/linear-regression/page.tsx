import type { Metadata } from "next";
import { LinearRegressionHome } from "@/components/linear-regression-home";

export const metadata: Metadata = {
  title: "Linear regression",
};

export default function LinearRegressionPage() {
  return <LinearRegressionHome />;
}
