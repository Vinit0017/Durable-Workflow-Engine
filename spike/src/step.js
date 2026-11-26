import { createStep, searchStep } from "./db.js";

export function createStepRunner(runId, options = {}) {
  const { afterExecute } = options;

  return {
    async run(name, fn) {
      const existing = await searchStep(runId, name);

      if (existing) {
        console.log(`[SKIP] ${name} already exists!`);
        return existing.output;
      }

      console.log(`[RUN] ${name}`);

      const output = await fn();

      if (afterExecute) {
        await afterExecute(name, output);
      }

      await createStep(runId, name, output);

      return output;
    },
  };
}