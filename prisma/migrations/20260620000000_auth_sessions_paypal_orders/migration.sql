-- Session table backing HTTP-only-cookie JWT auth (revocable server-side)
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PaypalOrder table — one row per created order, independent of Lead's
-- flat paid/paymentId cache columns, so retries don't collide
CREATE TABLE "PaypalOrder" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "captureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaypalOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaypalOrder_orderId_key" ON "PaypalOrder"("orderId");
CREATE INDEX "PaypalOrder_leadId_idx" ON "PaypalOrder"("leadId");
CREATE INDEX "PaypalOrder_orderId_idx" ON "PaypalOrder"("orderId");
CREATE INDEX "PaypalOrder_status_idx" ON "PaypalOrder"("status");

-- Compound index for the common admin-dashboard list query shape
-- (filter by status + priority, sorted by recency)
CREATE INDEX "Lead_status_priority_createdAt_idx" ON "Lead"("status", "priority", "createdAt");
