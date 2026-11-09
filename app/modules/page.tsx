import { redirect } from "next/navigation";

/** Old modules index; the home page is the module picker now. */
export default function ModulesRedirectPage() {
  redirect("/");
}
