-- CreateTable
CREATE TABLE "steps" (
    "run_id" SERIAL NOT NULL,
    "step_key" TEXT NOT NULL,
    "output" JSONB NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("run_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "steps_run_id_step_key_key" ON "steps"("run_id", "step_key");
