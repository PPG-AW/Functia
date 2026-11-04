import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { StudentTopbar } from "@/components/StudentTopbar";
import { getStudentContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BelajarLayout({ children }: { children: ReactNode }) {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/#masuk-siswa");

  return (
    <div className="min-h-screen bg-[#f6f9ff]">
      <StudentTopbar
        initial={{
          name: ctx.student.name,
          className: ctx.student.class_name,
          progress: ctx.session.progress,
        }}
      />
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">{children}</div>
    </div>
  );
}
