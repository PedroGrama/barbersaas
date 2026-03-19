"use client";

import { useRouter } from "next/navigation";

export function DatePicker({ initialDate }: { initialDate: string }) {
  const router = useRouter();
  return (
    <input
      type="date"
      name="date"
      defaultValue={initialDate}
      onChange={(e) => {
        if (e.target.value) {
          router.push(`/tenant?date=${e.target.value}`);
        }
      }}
      className="ml-2 rounded-lg border px-2 py-1 text-sm dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    />
  );
}
