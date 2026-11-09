import type { Metadata } from "next";
import { SigmoidLab } from "@/components/lab/sigmoid-lab";

export const metadata: Metadata = {
  title: "Sigmoid lab",
};

export default function SigmoidLabPage() {
  return <SigmoidLab />;
}
