-- AlterTable
ALTER TABLE "users" ADD COLUMN     "google_id" VARCHAR(255),
ADD COLUMN     "provider" VARCHAR(20) NOT NULL DEFAULT 'local',
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
