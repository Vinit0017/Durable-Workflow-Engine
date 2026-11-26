-- CreateEnum
CREATE TYPE "workflow_status" AS ENUM ('COMPLETED', 'PENDING', 'FAILED', 'WAITING', 'RUNNING', 'CANCELED', 'SLEEPING', 'QUEUED');

-- CreateEnum
CREATE TYPE "run_status" AS ENUM ('COMPLETED', 'PENDING', 'RUNNING', 'WAITING', 'FAILED');

-- CreateTable
CREATE TABLE "workflow_runs" (
    "id" TEXT NOT NULL,
    "workflow_name" TEXT NOT NULL,
    "status" "workflow_status" NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" JSONB,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "workflow_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_steps" (
    "run_id" TEXT NOT NULL,
    "step_key" TEXT NOT NULL,
    "status" "run_status" NOT NULL,
    "output" JSONB,
    "error" JSONB,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3)
);

-- CreateIndex
CREATE UNIQUE INDEX "run_steps_run_id_step_key_key" ON "run_steps"("run_id", "step_key");

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "workflow_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
