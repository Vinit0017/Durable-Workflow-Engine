import prisma from "../config/prisma.config.js";
import { createStepRunner } from "./step.js";
import { findPendingWorkflowRun } from "../queries/raw.queries.js";
import * as engineQueries from "../queries/workflow.queries.js";

export async function claimNextRun(db) {
    const result = prisma.$transaction(async (tx) =>{
        const rows = await findPendingWorkflowRun(tx);

        if(!rows.length) return null;

        const claimed = await engineQueries.updateWorkflowStatus(rows[0].id, "RUNNING", tx);
        
        return claimed;
    });
    return result;
};

export async function executeClaimedRun(engine, run) {
    const { db, workflows} = engine;
    const handler = workflows.get(run.workflow_name);

    if(!handler) {
        const error = {message: `Missing workflow hander: ${run.workflow_name}`, name: "MissingHandlerError"};
        await engineQueries.failedWorkflowRun(run.id, "FAILED", error);
        return;
    }

    const step = createStepRunner(run.id);

    try{
        const output = await handler({input: run.input, step});

        await engineQueries.successfulWorkflowRun(run.id, "COMPLETED", output);
        return;
    }catch(err){
        const error = {message: err.message, name: err.name};
        await engineQueries.failedWorkflowRun(run.id, "FAILED", error);
    }
};