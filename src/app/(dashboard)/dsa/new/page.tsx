import Link from "next/link";
import { DsaForm } from "@/components/dsa/dsa-form";

export default function NewDsaPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/dsa" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
        ← DSA Problems
      </Link>
      <DsaForm mode="create" />
    </div>
  );
}
