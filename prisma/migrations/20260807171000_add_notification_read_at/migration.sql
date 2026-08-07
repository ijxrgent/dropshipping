-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
