import type { Metadata } from "next";
import { ForestLab } from "@/components/lab/forest-lab";

export const metadata: Metadata = {
  title: "Forest lab",
};

export default function ForestLabPage() {
  return <ForestLab />;
}
