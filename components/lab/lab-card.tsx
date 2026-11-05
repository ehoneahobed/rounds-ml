import Link from "next/link";

/** A door into the 3D bench, used on the project home and on the early concept pages. */
export function LabCard() {
  return (
    <Link href="/lab" className="my-6 block border border-navy bg-navy px-4 py-4 text-[#f3efe6] hover:bg-[#1b2736]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e2b340]">3D lab</p>
      <p className="mt-1 font-serif text-2xl tracking-tight">Turn the teaching tree</p>
      <p className="mt-1 text-sm leading-relaxed text-[#d9d2c5]">
        Eight patients on a table you can rotate. Open one cut, then the next, then slide a new patient through the questions.
      </p>
    </Link>
  );
}
