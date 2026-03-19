"use server";

import { getSessionUser, setSessionCookie } from "@/server/auth";
import { redirect } from "next/navigation";

export async function impersonateTenant(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  const user = await getSessionUser();

  if (!user || user.role !== "admin_geral") {
    throw new Error("Unauthorized");
  }

  await setSessionCookie({
    ...user,
    tenantId,
  });

  redirect("/tenant");
}
