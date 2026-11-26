/*
  Warnings:

  - The primary key for the `steps` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "steps_run_id_step_key_key";

-- AlterTable
ALTER TABLE "steps" DROP CONSTRAINT "steps_pkey",
ADD CONSTRAINT "steps_pkey" PRIMARY KEY ("run_id", "step_key");
