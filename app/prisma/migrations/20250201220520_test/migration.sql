/*
  Warnings:

  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `churnRisk` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `lastPredictedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `accuracy` on the `ModelVersion` table. All the data in the column will be lost.
  - Added the required column `metrics` to the `ModelVersion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "cl_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transaction_freq" INTEGER NOT NULL DEFAULT 0,
    "avg_transaction_amount" REAL NOT NULL DEFAULT 0,
    "time_since_last_transaction" INTEGER NOT NULL DEFAULT 0,
    "mcc_diversity" INTEGER NOT NULL DEFAULT 0,
    "preferred_channel" TEXT NOT NULL DEFAULT '',
    "mean_hour" REAL NOT NULL DEFAULT 0,
    "std_hour" REAL NOT NULL DEFAULT 0,
    "mean_day_of_week" REAL NOT NULL DEFAULT 0,
    "std_day_of_week" REAL NOT NULL DEFAULT 0,
    "mean_month" REAL NOT NULL DEFAULT 0,
    "std_month" REAL NOT NULL DEFAULT 0,
    "churn_probability" REAL,
    "last_predicted" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Customer" ("cl_id") SELECT "cl_id" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_cl_id_key" ON "Customer"("cl_id");
CREATE TABLE "new_ModelVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "trainedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ModelVersion" ("id", "path", "trainedAt", "version") SELECT "id", "path", "trainedAt", "version" FROM "ModelVersion";
DROP TABLE "ModelVersion";
ALTER TABLE "new_ModelVersion" RENAME TO "ModelVersion";
CREATE UNIQUE INDEX "ModelVersion_version_key" ON "ModelVersion"("version");
CREATE TABLE "new_Transaction" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_cl_id_fkey" FOREIGN KEY ("cl_id") REFERENCES "Customer" ("cl_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("MCC", "PERIOD", "TRDATETIME", "amount", "channel_type", "cl_id", "currency", "id", "target_sum", "trx_category") SELECT "MCC", "PERIOD", "TRDATETIME", "amount", "channel_type", "cl_id", "currency", "id", "target_sum", "trx_category" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
