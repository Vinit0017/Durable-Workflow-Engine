/*
  Warnings:

  - A unique constraint covering the columns `[workflow_name,idempotency_key]` on the table `workflow_runs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workflow_runs_workflow_name_idempotency_key_key" ON "workflow_runs"("workflow_name", "idempotency_key");
