-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('New', 'AutoRejected', 'NeedsReview', 'Watchlist', 'PrivateTarget', 'FollowUp', 'NewsletterCandidate', 'Acquired', 'Passed');

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "askingPrice" DOUBLE PRECISION,
    "monthlyRevenue" DOUBLE PRECISION,
    "monthlyProfit" DOUBLE PRECISION,
    "revenueMultiple" DOUBLE PRECISION,
    "profitMultiple" DOUBLE PRECISION,
    "assetType" TEXT NOT NULL DEFAULT '',
    "niche" TEXT NOT NULL DEFAULT '',
    "age" TEXT NOT NULL DEFAULT '',
    "trafficSources" TEXT NOT NULL DEFAULT '',
    "monthlyVisitors" INTEGER,
    "emailListSize" INTEGER,
    "monetization" TEXT NOT NULL DEFAULT '',
    "techStack" TEXT NOT NULL DEFAULT '',
    "ownerWorkload" TEXT NOT NULL DEFAULT '',
    "reasonForSale" TEXT NOT NULL DEFAULT '',
    "sellerClaims" TEXT NOT NULL DEFAULT '',
    "evidenceAvailable" TEXT NOT NULL DEFAULT '',
    "riskNotes" TEXT NOT NULL DEFAULT '',
    "upsideNotes" TEXT NOT NULL DEFAULT '',
    "withinBudget" BOOLEAN NOT NULL DEFAULT false,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ListingStatus" NOT NULL DEFAULT 'New',
    "score" INTEGER NOT NULL DEFAULT 0,
    "scoreBreakdown" JSONB,
    "dealMemo" TEXT,
    "sourceHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanRun" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "listingsFound" INTEGER NOT NULL DEFAULT 0,
    "newAdded" INTEGER NOT NULL DEFAULT 0,
    "autoRejected" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceHealth" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "lastSuccess" TIMESTAMP(3),
    "lastFailure" TIMESTAMP(3),
    "consecutiveFails" INTEGER NOT NULL DEFAULT 0,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigestArchive" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "listings" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigestArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_sourceHash_key" ON "Listing"("sourceHash");

-- CreateIndex
CREATE UNIQUE INDEX "SourceHealth_source_key" ON "SourceHealth"("source");
