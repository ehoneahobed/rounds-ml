import type { Metadata } from "next";
import { LineLab } from "@/components/lab/line-lab";

export const metadata: Metadata = {
  title: "Line lab",
};

export default function LineLabPage() {
  return <LineLab />;
}
