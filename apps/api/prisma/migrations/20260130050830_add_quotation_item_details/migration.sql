-- AlterTable
ALTER TABLE "quotation_items" ADD COLUMN     "details" TEXT;

-- CreateTable
CREATE TABLE "billing_notes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "document_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "customer_id" TEXT NOT NULL,
    "total_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_note_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "billing_note_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "billing_note_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_notes_tenant_id_document_number_key" ON "billing_notes"("tenant_id", "document_number");

-- AddForeignKey
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_note_items" ADD CONSTRAINT "billing_note_items_billing_note_id_fkey" FOREIGN KEY ("billing_note_id") REFERENCES "billing_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_note_items" ADD CONSTRAINT "billing_note_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
