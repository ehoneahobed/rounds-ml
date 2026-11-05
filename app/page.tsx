import type { Metadata } from "next";
import { ProjectHome } from "@/components/project-home";

export const metadata: Metadata = {
  title: "Decision trees",
};

export default function Page() {
  return <ProjectHome />;
}
