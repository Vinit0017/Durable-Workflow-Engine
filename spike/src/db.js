import prisma from "../../workflow_engine/config/prisma.config.js"

export async function createStep(runId, stepkey, output) {
    return prisma.steps.create({
        data:{
            run_id: runId,
            step_key: stepkey,
            output: output,   
        },
    });
};

export async function searchStep(run_id, step_key) {
    return prisma.steps.findUnique({
        where:{
            run_id_step_key:{
                run_id: run_id,
                step_key: step_key,
            },
        },
    });
};