-- CreateTable
CREATE TABLE "barber_business_hours" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "break_start_time" VARCHAR(5),
    "break_end_time" VARCHAR(5),
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "barber_business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "barber_business_hours_tenant_id_idx" ON "barber_business_hours"("tenant_id");

-- CreateIndex
CREATE INDEX "barber_business_hours_barber_id_idx" ON "barber_business_hours"("barber_id");

-- AddForeignKey
ALTER TABLE "barber_business_hours" ADD CONSTRAINT "barber_business_hours_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_business_hours" ADD CONSTRAINT "barber_business_hours_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
