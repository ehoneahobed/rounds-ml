import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Missing page</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">That page is not in this module.</h1>
      <p className="mt-3 leading-relaxed">The decision-tree project is the only module in Rounds right now.</p>
      <Link href="/" className="mt-6 inline-block font-semibold text-green">
        Back to the project
      </Link>
    </div>
  );
}
