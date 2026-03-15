/*
  Warnings:

  - The values [HTTP] on the enum `PLATFORM` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PLATFORM_new" AS ENUM ('TELEGRAM', 'RESEND', 'HTTP_REQUEST');
ALTER TABLE "Node" ALTER COLUMN "actionPlatform" TYPE "PLATFORM_new" USING ("actionPlatform"::text::"PLATFORM_new");
ALTER TABLE "Credentials" ALTER COLUMN "platform" TYPE "PLATFORM_new" USING ("platform"::text::"PLATFORM_new");
ALTER TABLE "AvailableCredentialsApplications" ALTER COLUMN "platform" TYPE "PLATFORM_new" USING ("platform"::text::"PLATFORM_new");
ALTER TYPE "PLATFORM" RENAME TO "PLATFORM_old";
ALTER TYPE "PLATFORM_new" RENAME TO "PLATFORM";
DROP TYPE "public"."PLATFORM_old";
COMMIT;
