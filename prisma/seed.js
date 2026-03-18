/* eslint-disable no-console */
require("dotenv/config");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const adminEmail = "admin@local";
  const tenantEmail = "tenant@local";
  const barberEmail = "barbeiro@local";

  const adminPass = "admin123";
  const tenantPass = "tenant123";
  const barberPass = "barber123";

  const adminHash = await bcrypt.hash(adminPass, 10);
  const tenantHash = await bcrypt.hash(tenantPass, 10);
  const barberHash = await bcrypt.hash(barberPass, 10);

  const tenant = await prisma.tenant.upsert({
    where: { id: "seed-tenant-1" },
    update: {
      name: "Barbearia Demo",
      isActive: true,
    },
    create: {
      id: "seed-tenant-1",
      name: "Barbearia Demo",
      phone: "(11) 99999-0000",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Admin Geral", passwordHash: adminHash, role: "admin_geral", isActive: true },
    create: {
      name: "Admin Geral",
      email: adminEmail,
      passwordHash: adminHash,
      role: "admin_geral",
      isActive: true,
      tenantId: null,
      isBarber: false,
    },
  });

  const tenantAdmin = await prisma.user.upsert({
    where: { email: tenantEmail },
    update: {
      tenantId: tenant.id,
      name: "Admin da Barbearia",
      passwordHash: tenantHash,
      role: "tenant_admin",
      isActive: true,
      isBarber: true,
    },
    create: {
      tenantId: tenant.id,
      name: "Admin da Barbearia",
      email: tenantEmail,
      passwordHash: tenantHash,
      role: "tenant_admin",
      isActive: true,
      isBarber: true,
    },
  });

  const barber = await prisma.user.upsert({
    where: { email: barberEmail },
    update: {
      tenantId: tenant.id,
      name: "Barbeiro 1",
      passwordHash: barberHash,
      role: "barbeiro",
      isActive: true,
      isBarber: true,
    },
    create: {
      tenantId: tenant.id,
      name: "Barbeiro 1",
      email: barberEmail,
      passwordHash: barberHash,
      role: "barbeiro",
      isActive: true,
      isBarber: true,
    },
  });

  // Payment settings: BOTH, PIX directo default, cash allowed
  const pixKey = await prisma.pixKey.upsert({
    where: { id: "seed-pix-tenant" },
    update: {
      tenantId: tenant.id,
      ownerType: "TENANT",
      keyType: "EVP",
      keyValue: "00000000-0000-0000-0000-000000000000",
      receiverName: "Barbearia Demo",
      isActive: true,
    },
    create: {
      id: "seed-pix-tenant",
      tenantId: tenant.id,
      ownerType: "TENANT",
      keyType: "EVP",
      keyValue: "00000000-0000-0000-0000-000000000000",
      receiverName: "Barbearia Demo",
      isActive: true,
    },
  });

  await prisma.tenantPaymentSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      paymentMode: "BOTH",
      defaultPixKeyId: pixKey.id,
      allowCash: true,
      allowBarberSelectPixKey: true,
    },
    create: {
      tenantId: tenant.id,
      paymentMode: "BOTH",
      defaultPixKeyId: pixKey.id,
      allowCash: true,
      allowBarberSelectPixKey: true,
    },
  });

  // Business hours default: 09:00-19:00 with lunch 13:00-14:00 (Mon-Sat)
  for (let weekday = 1; weekday <= 6; weekday += 1) {
    await prisma.tenantBusinessHour.upsert({
      where: { id: `seed-bh-${weekday}` },
      update: {
        tenantId: tenant.id,
        weekday,
        startTime: "09:00",
        endTime: "19:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        isClosed: false,
      },
      create: {
        id: `seed-bh-${weekday}`,
        tenantId: tenant.id,
        weekday,
        startTime: "09:00",
        endTime: "19:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        isClosed: false,
      },
    });
  }

  // Services default (multiples of 30)
  const services = [
    { id: "seed-svc-corte", name: "Corte simples", durationMinutes: 30, basePrice: "35.00" },
    { id: "seed-svc-barba", name: "Barba", durationMinutes: 30, basePrice: "30.00" },
    { id: "seed-svc-combo", name: "Corte + barba", durationMinutes: 60, basePrice: "60.00" },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {
        tenantId: tenant.id,
        name: s.name,
        durationMinutes: s.durationMinutes,
        basePrice: s.basePrice,
        isActive: true,
      },
      create: {
        id: s.id,
        tenantId: tenant.id,
        name: s.name,
        durationMinutes: s.durationMinutes,
        basePrice: s.basePrice,
        isActive: true,
      },
    });
  }

  // Create a demo client + appointment today (next slot) if none exist
  const client = await prisma.client.upsert({
    where: { id: "seed-client-1" },
    update: { tenantId: tenant.id, name: "Cliente Demo", phone: "(11) 98888-7777" },
    create: {
      id: "seed-client-1",
      tenantId: tenant.id,
      name: "Cliente Demo",
      phone: "(11) 98888-7777",
      updatedByUserId: tenantAdmin.id,
    },
  });

  const now = new Date();
  const slot = new Date(now);
  slot.setMinutes(0, 0, 0);
  slot.setHours(Math.min(Math.max(slot.getHours() + 1, 9), 18));

  const end = new Date(slot);
  end.setMinutes(end.getMinutes() + 30);

  const appt = await prisma.appointment.upsert({
    where: { id: "seed-appt-1" },
    update: {
      tenantId: tenant.id,
      clientId: client.id,
      barberId: barber.id,
      scheduledStart: slot,
      scheduledEnd: end,
      origin: "app",
      status: "confirmed",
      pricingOriginal: "35.00",
      discountApplied: "0.00",
      pricingFinal: "35.00",
    },
    create: {
      id: "seed-appt-1",
      tenantId: tenant.id,
      clientId: client.id,
      barberId: barber.id,
      scheduledStart: slot,
      scheduledEnd: end,
      origin: "app",
      status: "confirmed",
      pricingOriginal: "35.00",
      discountApplied: "0.00",
      pricingFinal: "35.00",
    },
  });

  await prisma.appointmentItem.upsert({
    where: { id: "seed-appt-item-1" },
    update: {
      appointmentId: appt.id,
      tenantId: tenant.id,
      serviceId: "seed-svc-corte",
      nameSnapshot: "Corte simples",
      durationMinutesSnapshot: 30,
      unitPriceSnapshot: "35.00",
      quantity: 1,
      addedByUserId: barber.id,
    },
    create: {
      id: "seed-appt-item-1",
      appointmentId: appt.id,
      tenantId: tenant.id,
      serviceId: "seed-svc-corte",
      nameSnapshot: "Corte simples",
      durationMinutesSnapshot: 30,
      unitPriceSnapshot: "35.00",
      quantity: 1,
      addedByUserId: barber.id,
    },
  });

  console.log("Seed OK");
  console.log("Logins:");
  console.log(`- admin: ${adminEmail} / ${adminPass}`);
  console.log(`- tenant_admin: ${tenantEmail} / ${tenantPass}`);
  console.log(`- barbeiro: ${barberEmail} / ${barberPass}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

