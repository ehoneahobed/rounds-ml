import type { Metadata } from "next";
import { WardNoteForm } from "@/components/ward-note";

export const metadata: Metadata = {
  title: "Ward note",
};

export default function LinearRegressionNotePage() {
  return <WardNoteForm />;
}
