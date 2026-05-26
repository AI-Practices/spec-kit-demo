-- CreateTable
CREATE TABLE "MonthlySummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "monthlySavings" INTEGER NOT NULL,
    "lastMonthRemaining" INTEGER NOT NULL,
    "giveBackForExpenses" INTEGER NOT NULL,
    "loanAmount" INTEGER NOT NULL,
    "balanceForNextMonth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlySummary_personId_year_idx" ON "MonthlySummary"("personId", "year");

-- CreateIndex
CREATE INDEX "MonthlySummary_userId_personId_idx" ON "MonthlySummary"("userId", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySummary_personId_month_year_key" ON "MonthlySummary"("personId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlySummary" ADD CONSTRAINT "MonthlySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySummary" ADD CONSTRAINT "MonthlySummary_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
