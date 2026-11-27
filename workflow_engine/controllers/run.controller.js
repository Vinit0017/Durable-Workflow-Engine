import * as workflowQueries from "../queries/workflow.queries.js";
import { getConnection } from "../queries/raw.queries.js";

export async function startWorkflowRun(req, res, next) {
    try{
        const { workflow, input, idempotencyKey } = req.body;
        const engine = req.engine;

        if(!workflow || !engine.workflows.has(workflow))return res.status(400).json({error: "Invalid or unregisterd workflow!"});

        const {run, created} = await engine.start(workflow, input, {idempotencyKey});
        return res.status(created? 201: 200).json(run);
    }catch(err){
        next(err);
    }
};

export async function findWorkflowRun(req, res, next) {
    try{
        const id = req.params.id;
        const run = await workflowQueries.findWorkflowRun(id);

        if(!run) return res.status(404).json({error: "Run not found!"});
        return res.status(200).json(run);
    }catch(err){
        next(err);
    }
};

export async function findAllRuns(req, res, next) {
    try{
        const { cursor, limit } = req.params;
        const runs = await workflowQueries.findWorkflowRuns(cursor, limit);

        const hasMore = runs.length > limit;
        const data = hasMore ? runs.slice(0, limit): runs;
        const nextCursor = hasMore ? data[data.length - 1].id: undefined;

        return res.status(200).json({data, "nextCursor":nextCursor});
    }catch(err){
        next(err);
    }
};

export async function health(req, res, next) {
    try{
        await getConnection();
        return res.status(200).json({status: "ok"});
    }catch(err){
        next(err);
    }
};