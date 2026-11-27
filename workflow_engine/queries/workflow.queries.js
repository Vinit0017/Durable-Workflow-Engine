import prisma from "../config/prisma.config.js";

export async function createWorkflowRun(name, input, status, db=prisma) {
    return db.workflow_runs.create({
        data:{
            workflow_name: name,
            input: input,
            status: status,
        }
    });
};

export async function findWorkflowRun(name, idempotencyKey, db=prisma) {
    return db.workflow_runs.findUnique({
        where:{
            workflow_name_idempotency_key:{
                workflow_name: name,
                idempotency_key: idempotencyKey,
            },
        },
    });
};

export async function findWorkflowRun(id, db=prisma) {
    return db.workflow_runs.findUnique({
        where:{
            id: id,
        },
        include:{
            steps:{
                orderBy: {started_at: "asc"},
            },
        },
    });
};

export async function updateWorkflowStatus(id, status, db=prisma) {
    return db.workflow_runs.update({
        where:{
            id: id,
        },
        data:{
            status: status,
        },
    });
};

export async function failedWorkflowRun(id, status, error, db=prisma) {
    return db.workflow_runs.update({
        where:{
            id: id,
        },
        data:{
            status: status,
            error: error,
        },
    });
}

export async function successfulWorkflowRun(id, status, output) {
    return db.workflow_name.update({
        where:{
            id: id,
        },
        data: {
            status: status,
            output: output === undefined ? null: output,
            error: null,
        },
    });
};

export async function findWorkflowRuns(cursor, limit, db=prisma) {
    return db.workflow_runs.findMany({
        take: limit + 1,
        ...(cursor && {
            cursor: {id: cursor},
            skip: 1,
        }),
        orderBy: [{created_at: "desc"},{id: "desc"}],
    });
}