-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "height" REAL,
    "weight" REAL,
    "goal" TEXT NOT NULL DEFAULT 'maintain',
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("account", "age", "createdAt", "gender", "goal", "height", "id", "name", "password", "weight") SELECT "account", "age", "createdAt", "gender", "goal", "height", "id", "name", "password", "weight" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_account_key" ON "User"("account");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
