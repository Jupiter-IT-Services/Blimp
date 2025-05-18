"use client";

import ForceHome from "@/components/auth/ForceHome";
import { modules } from "@/components/dashboard/modules";
import { useParams } from "next/navigation";

export default function ModulePage() {
  const { module, id } = useParams<{ module: string; id: string }>();
  const page = Object.keys(modules).includes(module.toLowerCase())
    ? modules[module as keyof typeof modules]
    : null;
  if (!page) return <ForceHome href={`/dashboard/${id}`} />;
  return page;
}
