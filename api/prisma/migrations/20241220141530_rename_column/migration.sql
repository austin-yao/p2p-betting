/*
  Warnings:

  - You are about to drop the column `betId` on the `Bet` table. All the data in the column will be lost.
  - Added the required column `bet_id` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bet_id" TEXT NOT NULL,
    "creator" TEXT,
    "acceptor" TEXT,
    "question" TEXT,
    "for_amount" INTEGER,
    "against_amount" INTEGER,
    "agreed_by_both" BOOLEAN NOT NULL DEFAULT false,
    "game_start_time" TEXT,
    "game_end_time" TEXT,
    "status" INTEGER NOT NULL DEFAULT 4,
    "create_time" TEXT,
    "sent_to_oracle" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Bet" ("acceptor", "against_amount", "agreed_by_both", "bet_id", "create_time", "creator", "for_amount", "game_end_time", "game_start_time", "id", "question", "sent_to_oracle", "status") SELECT "acceptor", "against_amount", "agreed_by_both", "betId", "create_time", "creator", "for_amount", "game_end_time", "game_start_time", "id", "question", "sent_to_oracle", "status" FROM "Bet";
DROP TABLE "Bet";
ALTER TABLE "new_Bet" RENAME TO "Bet";
CREATE UNIQUE INDEX "Bet_bet_id_key" ON "Bet"("bet_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
