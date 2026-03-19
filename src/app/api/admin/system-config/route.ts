import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
  if (!config) {
    config = await prisma.systemConfig.create({ data: { id: "global" } });
  }

  return NextResponse.json({ config });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { contactEmail, contactPhone, platformPixKey, defaultTaxPct, defaultMonthlyFee } = body;

  const config = await prisma.systemConfig.upsert({
    where: { id: "global" },
    create: { id: "global", contactEmail, contactPhone, platformPixKey, defaultTaxPct, defaultMonthlyFee },
    update: { contactEmail, contactPhone, platformPixKey, defaultTaxPct, defaultMonthlyFee },
  });

  return NextResponse.json({ ok: true, config });
}
