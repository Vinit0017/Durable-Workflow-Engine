import { createStepRunner } from "./step.js";

async function bookingWorkflow(runId) {
  const step = createStepRunner(runId);

  const customer = await step.run("create_customer", async () => {
    console.log("Creating customer...");

    return {
      id: 101,
      name: "Alex",
    };
  });

  const room = await step.run("reserve_room", async () => {
    console.log("Reserving room...");

    return {
      roomId: "A101",
      price: 5000,
    };
  });

  const payment = await step.run("process_payment", async () => {
    console.log("Processing payment...");

    return {
      paymentId: "PAY-001",
      amount: room.price,
      status: "success",
    };
  });

  console.log("\nWorkflow result:");
  console.log({ customer, room, payment });
}

async function main() {
  await bookingWorkflow(2);
}

main()
  .catch(console.error);