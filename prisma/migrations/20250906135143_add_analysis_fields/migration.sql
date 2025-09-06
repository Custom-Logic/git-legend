-- AlterTable
ALTER TABLE "public"."analyses" ADD COLUMN     "modelUsageStats" JSONB,
ADD COLUMN     "summariesGenerated" INTEGER;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."ai_model_configs" (
    "id" TEXT NOT NULL,
    "primaryModel" TEXT NOT NULL,
    "fallbackModel" TEXT NOT NULL,
    "enabledModels" JSONB NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_model_configs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ai_model_configs" ADD CONSTRAINT "ai_model_configs_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
