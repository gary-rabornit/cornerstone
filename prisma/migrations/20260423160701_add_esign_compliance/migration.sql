-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "signatureImage" TEXT,
    "signatureMode" TEXT,
    "signedAt" DATETIME,
    "signedByName" TEXT,
    "signedByEmail" TEXT,
    "signedByTitle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "consentedToElectronicSig" BOOLEAN NOT NULL DEFAULT false,
    "consentedAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "documentSnapshot" TEXT,
    "documentHash" TEXT,
    "signedVersion" INTEGER,
    "auditTrail" TEXT NOT NULL DEFAULT '[]',
    "viewedAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientAccess_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClientAccess" ("createdAt", "id", "proposalId", "signatureImage", "signedAt", "signedByEmail", "signedByName", "status", "token", "viewCount", "viewedAt") SELECT "createdAt", "id", "proposalId", "signatureImage", "signedAt", "signedByEmail", "signedByName", "status", "token", "viewCount", "viewedAt" FROM "ClientAccess";
DROP TABLE "ClientAccess";
ALTER TABLE "new_ClientAccess" RENAME TO "ClientAccess";
CREATE UNIQUE INDEX "ClientAccess_proposalId_key" ON "ClientAccess"("proposalId");
CREATE UNIQUE INDEX "ClientAccess_token_key" ON "ClientAccess"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
