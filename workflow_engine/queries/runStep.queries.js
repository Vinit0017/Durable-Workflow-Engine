import prisma from "../config/prisma.config.js";

export async function findRunStep(run_id, step_key, db=prisma) {
    return db.run_steps.findUnique({
        where:{
            run_id_step_key:{
                run_id: run_id,
                step_key: step_key,
            },
        },
    });
};

export async function modifyRunSteps(run_id, step_key, db=prisma) {
    const now = new Date();
    return db.run_steps.upsert({
        where:{
            run_id_step_key:{
                run_id: run_id,
                step_key: step_key
            }
        },
        update: {
            status: "RUNNING",
            error: null,
            started_at: now,
            finished_at: null,
        },
        create:{
            run_id: run_id,
            step_key: step_key,
            status: "RUNNING",
            started_at: now,
        },
    });
};

export async function successfulRunStep(run_id, step_key, result, db=prisma) {
    return db.run_steps.update({
        where:{
            run_id_step_key:{
                run_id: run_id,
                step_key: step_key,
            },
        },
        data:{
            status: "COMPLETED",
            output: result === undefined ? null : result,
            finished_at: new Date(),
        },
    });
};

export async function errorProneRunStep(run_id, step_key, error, db=prisma) {
    return db.run_steps.update({
        where:{
            run_id_step_key:{
                run_id: run_id,
                step_key: step_key,
            },
        },
        data:{
            status: "FAILED",
            error:{message: error.message, name: error.name},
            finished_at: new Date(),
        },
    });
};