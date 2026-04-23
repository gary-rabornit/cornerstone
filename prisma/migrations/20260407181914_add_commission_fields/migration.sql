-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL DEFAULT 'RABORN_MEDIA',
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "companyWebsite" TEXT,
    "commissionApplicable" BOOLEAN NOT NULL DEFAULT false,
    "commissionRecipient" TEXT,
    "coCommissionApplicable" BOOLEAN NOT NULL DEFAULT false,
    "coCommissionRecipient" TEXT,
    "industry" TEXT,
    "serviceType" TEXT,
    "value" REAL NOT NULL DEFAULT 0,
    "stage" TEXT NOT NULL DEFAULT 'LEAD',
    "stageEnteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Deal" ("company", "companyName", "companyWebsite", "contactEmail", "contactName", "contactPhone", "createdAt", "id", "industry", "ownerId", "serviceType", "stage", "stageEnteredAt", "updatedAt", "value") SELECT "company", "companyName", "companyWebsite", "contactEmail", "contactName", "contactPhone", "createdAt", "id", "industry", "ownerId", "serviceType", "stage", "stageEnteredAt", "updatedAt", "value" FROM "Deal";
DROP TABLE "Deal";
ALTER TABLE "new_Deal" RENAME TO "Deal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
