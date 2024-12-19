-- CreateTable
CREATE TABLE "Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" TEXT NOT NULL,
    "creator" TEXT,
    "acceptor" TEXT,
    "question" TEXT,
    "for_amount" INTEGER,
    "against_amount" INTEGER,
    "agreed_by_both" BOOLEAN NOT NULL DEFAULT false,
    "game_start_time" TEXT,
    "game_end_time" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Cursor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventSeq" TEXT NOT NULL,
    "txDigest" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Bet_betId_key" ON "Bet"("betId");
