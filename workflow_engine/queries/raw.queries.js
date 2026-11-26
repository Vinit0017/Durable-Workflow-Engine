import prisma from "../config/prisma.config";

export async function findPendingWorkflowRun(db=prisma) {
    const rows = await db.$queryRaw `SELECT id
        FROM workflow_runs
        WHERE status = 'PENDING'
        ORDER BY created_at ASC, id ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1;
    `;
    return rows;
}