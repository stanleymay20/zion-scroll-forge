-- ScrollBadge NFT System Migration
-- "By the Spirit of Excellence, we establish verifiable credentials on the blockchain"

-- ScrollBadge table
CREATE TABLE IF NOT EXISTS "ScrollBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" INTEGER NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "credentialType" TEXT NOT NULL,
    "ipfsHash" TEXT NOT NULL DEFAULT '',
    "metadataUri" TEXT NOT NULL DEFAULT '',
    "blockchainTxHash" TEXT,
    "blockNumber" INTEGER,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedReason" TEXT,
    "revokedAt" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "ownerAddress" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScrollBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScrollBadge_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Badge Verification table
CREATE TABLE IF NOT EXISTS "BadgeVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "badgeId" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL UNIQUE,
    "employerName" TEXT NOT NULL,
    "employerEmail" TEXT NOT NULL,
    "verificationPurpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BadgeVerification_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "ScrollBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Badge Share table
CREATE TABLE IF NOT EXISTS "BadgeShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "badgeId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "shareUrl" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BadgeShare_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "ScrollBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Badge Listing table (marketplace)
CREATE TABLE IF NOT EXISTS "BadgeListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "badgeId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "listedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),
    "buyerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BadgeListing_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "ScrollBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BadgeListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BadgeListing_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Badge Sale table
CREATE TABLE IF NOT EXISTS "BadgeSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "sellerAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BadgeSale_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BadgeListing"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BadgeSale_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "ScrollBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BadgeSale_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BadgeSale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "ScrollBadge_userId_idx" ON "ScrollBadge"("userId");
CREATE INDEX IF NOT EXISTS "ScrollBadge_courseId_idx" ON "ScrollBadge"("courseId");
CREATE INDEX IF NOT EXISTS "ScrollBadge_tokenId_idx" ON "ScrollBadge"("tokenId");
CREATE INDEX IF NOT EXISTS "ScrollBadge_credentialType_idx" ON "ScrollBadge"("credentialType");
CREATE INDEX IF NOT EXISTS "ScrollBadge_isRevoked_idx" ON "ScrollBadge"("isRevoked");
CREATE INDEX IF NOT EXISTS "ScrollBadge_isPublic_idx" ON "ScrollBadge"("isPublic");
CREATE INDEX IF NOT EXISTS "ScrollBadge_completionDate_idx" ON "ScrollBadge"("completionDate");

CREATE INDEX IF NOT EXISTS "BadgeVerification_badgeId_idx" ON "BadgeVerification"("badgeId");
CREATE INDEX IF NOT EXISTS "BadgeVerification_verificationCode_idx" ON "BadgeVerification"("verificationCode");
CREATE INDEX IF NOT EXISTS "BadgeVerification_expiresAt_idx" ON "BadgeVerification"("expiresAt");

CREATE INDEX IF NOT EXISTS "BadgeShare_badgeId_idx" ON "BadgeShare"("badgeId");
CREATE INDEX IF NOT EXISTS "BadgeShare_platform_idx" ON "BadgeShare"("platform");

CREATE INDEX IF NOT EXISTS "BadgeListing_badgeId_idx" ON "BadgeListing"("badgeId");
CREATE INDEX IF NOT EXISTS "BadgeListing_sellerId_idx" ON "BadgeListing"("sellerId");
CREATE INDEX IF NOT EXISTS "BadgeListing_isActive_idx" ON "BadgeListing"("isActive");
CREATE INDEX IF NOT EXISTS "BadgeListing_price_idx" ON "BadgeListing"("price");

CREATE INDEX IF NOT EXISTS "BadgeSale_listingId_idx" ON "BadgeSale"("listingId");
CREATE INDEX IF NOT EXISTS "BadgeSale_badgeId_idx" ON "BadgeSale"("badgeId");
CREATE INDEX IF NOT EXISTS "BadgeSale_sellerId_idx" ON "BadgeSale"("sellerId");
CREATE INDEX IF NOT EXISTS "BadgeSale_buyerId_idx" ON "BadgeSale"("buyerId");
