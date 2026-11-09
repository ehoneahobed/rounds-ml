"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useModule } from "@/lib/module-context";
import { moduleHref } from "@/lib/modules";

/**
 * Exit the lab back to the page that opened it, or to the module project.
 * LabCard passes ?from= with the current path when the door is clicked.
 */
export function LabBack() {
  return (
    <Suspense fallback={<LabBackFallback />}>
      <LabBackInner />
    </Suspense>
  );
}

function LabBackFallback() {
  const module = useModule();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={moduleHref(module, "/")} className="text-sm font-semibold text-green hover:underline">
        ← Module home
      </Link>
    </div>
  );
}

function LabBackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const module = useModule();
  const from = params.get("from");
  const safeFrom =
    from && from.startsWith(module.basePath || "/") && !from.includes("/lab") ? from : null;
  const fallback = moduleHref(module, "/");

  function goBack() {
    if (safeFrom) {
      router.push(safeFrom);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" size="sm" variant="outline" onClick={goBack}>
        ← Back to reading
      </Button>
      <Link href={fallback} className="text-sm font-semibold text-green hover:underline">
        Module home
      </Link>
    </div>
  );
}
