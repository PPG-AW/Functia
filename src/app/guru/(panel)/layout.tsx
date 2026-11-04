import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { TeacherNav } from "@/components/TeacherNav";
import { getTeacherContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeacherPanelLayout({ children }: { children: ReactNode }) {
  const teacher = await getTeacherContext();
  if (!teacher) redirect("/guru");

  return (
    <div className="min-h-screen bg-[#f2f5fc]">
      <TeacherNav teacher={{ name: teacher.name, email: teacher.email }} />
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6">{children}</main>
    </div>
  );
}
