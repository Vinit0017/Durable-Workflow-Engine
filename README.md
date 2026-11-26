# Durable Workflow Engine

## Core Design

A durable workflow is an ordinary async function whose side effects are wrapped in step calls. The engine stores every step's result in Postgres. If the process dies, any worker re-runs the function from the top. 
Completed steps return their stored result instantly instead of executing again, so the function fast-forwards to where it stopped. Sleeps and waits are not held in memory. The run is parked in database with a wake time or a wait condition, and a worker if free to do something else.

## SDK Design

```
const engine = createEngine({databaseUrl: process.env.DATABASE});
engine.workflow = ("order-fulfillment", async({input, step}) =>{
    const payment = await step.run("charge-card", () => charge(input.card, input.total));

    const step.sleep("let-warehouse-pick", "10s");

    const approval = await step.waitForEvent("manager-approval", {even: "order-approved", timeout: "1m", matchKey: "orderId"});

    if(!approval) return {status: "timed-out"};

    await step.run("send-confirmation", () =>
        sendEmail(input: email, payment.id)
    );

    return {status: "shipped", paymentId: payment.id};
});
```

## Status: Ongoing

