import type { Metadata } from "next";
import { TreeLab } from "@/components/lab/tree-lab";

export const metadata: Metadata = {
  title: "Tree lab",
};

export default function DecisionTreesLabPage() {
  return <TreeLab />;
}
