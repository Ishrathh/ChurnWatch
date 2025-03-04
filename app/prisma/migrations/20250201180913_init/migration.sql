-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cl_id" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "churnRisk" REAL,
    "lastPredictedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "PERIOD" DATETIME NOT NULL,
    "cl_id" INTEGER NOT NULL,
    "MCC" INTEGER NOT NULL,
    "channel_type" TEXT,
    "currency" INTEGER NOT NULL,
    "TRDATETIME" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "trx_category" TEXT NOT NULL,
    "target_sum" REAL NOT NULL,
    CONSTRAINT "Transaction_cl_id_fkey" FOREIGN KEY ("cl_id") REFERENCES "Customer" ("cl_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "accuracy" REAL,
    "trainedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cl_id_key" ON "Customer"("cl_id");

-- CreateIndex
CREATE UNIQUE INDEX "ModelVersion_version_key" ON "ModelVersion"("version");
