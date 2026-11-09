import type { Metadata } from "next";
import { ModuleHome } from "@/components/module-home";

export const metadata: Metadata = {
  title: "Random forests",
};

export default function RandomForestsPage() {
  return <ModuleHome />;
}
