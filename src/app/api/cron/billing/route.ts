import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

// GET /api/cron/billing
// Should be called daily by a CRON service (e.g., Vercel CRON, Railway, or a simple setInterval in a worker).
// For local testing: curl http://localhost:3000/api/cron/billing?secret=studioflow-cron-secret
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let suspended = 0;

  // 1. Suspend expired free trials
  const expiredTrials = await prisma.tenant.findMany({
    where: {
      licencaTipo: "TESTE_GRATIS",
      status: "ATIVO",
      testeExpiraEm: { lt: now },
    }
  });

  for (const tenant of expiredTrials) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: "SUSPENSO" }
    });
    suspended++;
  }

  // 2. Suspend TAXA_POR_SERVICO tenants if debt exceeds R$ 200
  const highDebtTenants = await prisma.tenant.findMany({
    where: {
      licencaTipo: "TAXA_POR_SERVICO",
      status: "ATIVO",
      saldoDevedor: { gt: 200 }
    }
  });

  for (const tenant of highDebtTenants) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: "INADIMPLENTE" }
    });
    suspended++;
  }

  return NextResponse.json({
    ok: true,
    suspended,
    processedAt: now.toISOString(),
    message: `Cron billing processado: ${expiredTrials.length} testes expirados, ${highDebtTenants.length} inadimplentes.`
  });
}
