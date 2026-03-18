-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin_geral', 'tenant_admin', 'barbeiro');

-- CreateEnum
CREATE TYPE "AppointmentOrigin" AS ENUM ('app', 'admin_panel', 'walk_in');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('confirmed', 'in_progress', 'awaiting_payment', 'done', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX_DIRECT', 'CASH', 'MERCADO_PAGO_PIX', 'MERCADO_PAGO_CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PixKeyOwnerType" AS ENUM ('TENANT', 'USER');

-- CreateEnum
CREATE TYPE "PixKeyType" AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP');

-- CreateEnum
CREATE TYPE "TenantPaymentMode" AS ENUM ('PIX_DIRECT', 'MERCADO_PAGO', 'BOTH');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" VARCHAR(18),
    "owner_name" TEXT,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "address" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_barber" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_user_id" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_business_hours" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "break_start_time" VARCHAR(5),
    "break_end_time" VARCHAR(5),
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tenant_business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_payment_settings" (
    "tenant_id" TEXT NOT NULL,
    "payment_mode" "TenantPaymentMode" NOT NULL,
    "default_pix_key_id" TEXT,
    "allow_cash" BOOLEAN NOT NULL DEFAULT true,
    "allow_barber_select_pix_key" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tenant_payment_settings_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3) NOT NULL,
    "origin" "AppointmentOrigin" NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "pricing_original" DECIMAL(10,2) NOT NULL,
    "discount_applied" DECIMAL(10,2) NOT NULL,
    "pricing_final" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "client_confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_items" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "service_id" TEXT,
    "name_snapshot" TEXT NOT NULL,
    "duration_minutes_snapshot" INTEGER NOT NULL,
    "unit_price_snapshot" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "added_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_reschedules" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "old_start" TIMESTAMP(3) NOT NULL,
    "old_end" TIMESTAMP(3) NOT NULL,
    "new_start" TIMESTAMP(3) NOT NULL,
    "new_end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "changed_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_reschedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pix_keys" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "owner_type" "PixKeyOwnerType" NOT NULL,
    "owner_user_id" TEXT,
    "key_type" "PixKeyType" NOT NULL,
    "key_value" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pix_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "pix_key_id" TEXT,
    "provider" TEXT,
    "provider_payment_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "clients_tenant_id_idx" ON "clients"("tenant_id");

-- CreateIndex
CREATE INDEX "clients_tenant_id_phone_idx" ON "clients"("tenant_id", "phone");

-- CreateIndex
CREATE INDEX "services_tenant_id_idx" ON "services"("tenant_id");

-- CreateIndex
CREATE INDEX "services_tenant_id_is_active_idx" ON "services"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "tenant_business_hours_tenant_id_idx" ON "tenant_business_hours"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_payment_settings_default_pix_key_id_key" ON "tenant_payment_settings"("default_pix_key_id");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_idx" ON "appointments"("tenant_id");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_scheduled_start_idx" ON "appointments"("tenant_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_barber_id_scheduled_start_idx" ON "appointments"("tenant_id", "barber_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "appointment_items_tenant_id_idx" ON "appointment_items"("tenant_id");

-- CreateIndex
CREATE INDEX "appointment_items_appointment_id_idx" ON "appointment_items"("appointment_id");

-- CreateIndex
CREATE INDEX "appointment_reschedules_appointment_id_idx" ON "appointment_reschedules"("appointment_id");

-- CreateIndex
CREATE INDEX "pix_keys_tenant_id_idx" ON "pix_keys"("tenant_id");

-- CreateIndex
CREATE INDEX "pix_keys_tenant_id_key_value_idx" ON "pix_keys"("tenant_id", "key_value");

-- CreateIndex
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_tenant_id_appointment_id_idx" ON "payments"("tenant_id", "appointment_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_business_hours" ADD CONSTRAINT "tenant_business_hours_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_payment_settings" ADD CONSTRAINT "tenant_payment_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_payment_settings" ADD CONSTRAINT "tenant_payment_settings_default_pix_key_id_fkey" FOREIGN KEY ("default_pix_key_id") REFERENCES "pix_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_items" ADD CONSTRAINT "appointment_items_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_items" ADD CONSTRAINT "appointment_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_items" ADD CONSTRAINT "appointment_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_items" ADD CONSTRAINT "appointment_items_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_reschedules" ADD CONSTRAINT "appointment_reschedules_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_reschedules" ADD CONSTRAINT "appointment_reschedules_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pix_keys" ADD CONSTRAINT "pix_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pix_keys" ADD CONSTRAINT "pix_keys_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_pix_key_id_fkey" FOREIGN KEY ("pix_key_id") REFERENCES "pix_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
