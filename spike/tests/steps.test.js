import { test, beforeEach, after, before} from "node:test";
import assert  from "node:assert/strict";

import prisma from "../../config/prisma.config.js";
import { createStepRunner } from "../src/step.js";

beforeEach(async() =>{
    await prisma.steps.deleteMany();
});

after(async() =>{
    await prisma.$disconnect();
});

test("Part 1: executes and saves all three steps", async () => {
  const runId = 1;
  const executed = [];

  const step = createStepRunner(runId);

  const customer = await step.run("create_customer", async () => {
    executed.push("create_customer");

    return { id: 101, name: "Alex" };
  });

  const room = await step.run("reserve_room", async () => {
    executed.push("reserve_room");

    return { roomId: "A101", price: 5000 };
  });

  const payment = await step.run("process_payment", async () => {
    executed.push("process_payment");

    return {
      paymentId: "PAY-001",
      amount: room.price,
      status: "success",
    };
  });

  assert.deepEqual(executed, [
    "create_customer",
    "reserve_room",
    "process_payment",
  ]);

  assert.deepEqual(customer, { id: 101, name: "Alex" });
  assert.deepEqual(room, { roomId: "A101", price: 5000 });
  assert.deepEqual(payment, {
    paymentId: "PAY-001",
    amount: 5000,
    status: "success",
  });

  const savedSteps = await prisma.steps.findMany({
    where: { run_id: runId },
  });

  assert.equal(savedSteps.length, 3);
});

test("Part 2: resumes from the first incomplete step", async () => {
  const runId = 2;

  const firstExecution = [];
  const secondExecution = [];

  const step1 = createStepRunner(runId);

  await step1.run("step_1", async () => {
    firstExecution.push("step_1");
    return "output_1";
  });

  await step1.run("step_2", async () => {
    firstExecution.push("step_2");
    return "output_2";
  });

  assert.deepEqual(firstExecution, ["step_1", "step_2"]);

  const step2 = createStepRunner(runId);

  await step2.run("step_1", async () => {
    secondExecution.push("step_1");
    return "output_1";
  });

  await step2.run("step_2", async () => {
    secondExecution.push("step_2");
    return "output_2";
  });

  await step2.run("step_3", async () => {
    secondExecution.push("step_3");
    return "output_3";
  });

  assert.deepEqual(secondExecution, ["step_3"]);

  const savedSteps = await prisma.steps.findMany({
    where: { run_id: runId },
  });

  assert.equal(savedSteps.length, 3);
});

test("Part 3: repeats side effect if crash happens before saving output", async () => {
  const runId = 3;

  let reservationCount = 0;
  
  const step1 = createStepRunner(runId, {
    afterExecute: async (name) => {
      if (name === "reserve_room") {
        throw new Error("Worker crashed before saving output");
      }
    },
  });

  await assert.rejects(
    step1.run("reserve_room", async () => {
      reservationCount++;

      console.log("Room reserved!");

      return { bookingId: "BOOK-123" };
    }),
    /Worker crashed/
  );

  assert.equal(reservationCount, 1);

  const savedStep = await prisma.steps.findUnique({
    where: {
      run_id_step_key: {
        run_id: runId,
        step_key: "reserve_room",
      },
    },
  });

  assert.equal(savedStep, null);

  const step2 = createStepRunner(runId);

  const result = await step2.run("reserve_room", async () => {
    reservationCount++;

    console.log("Room reserved again!");

    return { bookingId: "BOOK-456" };
  });

  assert.equal(reservationCount, 2);

  assert.deepEqual(result, { bookingId: "BOOK-456" });

  const completedStep = await prisma.steps.findUnique({
    where: {
      run_id_step_key: {
        run_id: runId,
        step_key: "reserve_room",
      },
    },
  });

  assert.deepEqual(completedStep.output, {
    bookingId: "BOOK-456",
  });
});