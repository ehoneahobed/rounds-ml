"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-4xl tracking-tight">This page hit an error.</h1>
      <p className="mt-3 leading-relaxed">Your drafts are still in this browser. Try the page again.</p>
      <Button type="button" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
