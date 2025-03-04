-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "target_flag" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Transaction_cl_id_fkey" FOREIGN KEY ("cl_id") REFERENCES "Customer" ("cl_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("MCC", "PERIOD", "TRDATETIME", "amount", "channel_type", "cl_id", "createdAt", "currency", "id", "target_sum", "trx_category") SELECT "MCC", "PERIOD", "TRDATETIME", "amount", "channel_type", "cl_id", "createdAt", "currency", "id", "target_sum", "trx_category" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
