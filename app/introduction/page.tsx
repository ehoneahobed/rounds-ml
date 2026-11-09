import type { Metadata } from "next";
import { IntroductionHome } from "@/components/introduction-home";

export const metadata: Metadata = {
  title: "Introduction to machine learning",
};

export default function IntroductionPage() {
  return <IntroductionHome />;
}
