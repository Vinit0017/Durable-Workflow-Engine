import * as engineQueries from "../queries/workflow.queries.js";
import { PrismaClient } from "../generated/prisma";


export class Engine {
    constructor(config){
        this.db = config.db;
        this.pollIntervalMs = config.pollIntervalMs ?? 500;
        this.concurrency = config.concurrency ?? 1;

        this.workflows = new Map();
    };

    workflow(name, handler){
        if(!name || typeof handler !== "function"){
            throw new Error("Workflow requires a name and an async handler function!");
        }
        if(this.workflows.has(name)){
            throw new Error(`Workflow already registered: ${name}`);
        }
        this.workflows.set(name, handler);
    }

    async start(name, input, { idempotencyKey = null} = {}){
        const handler = this.workflows.get(name);
        if(!handler){
            throw new Error(`Unknown workflow: ${name}`);
        }

        if(idempotencyKey){
            const existing = await engineQueries.findWorkflowRun(name, idempotencyKey);

            if(existing) return {run: existing, created: false};
        }

        const run = await engineQueries.createWorkflowRun(name, input, "PENDING");

        return {run, created: true};
    }

    createWorker(options = {}){
        return new Worker(this, {
            pollIntervalMs: options.pollIntervalMs ?? this.pollIntervalMs,
            concurrency: options.concurrency ?? this.concurrency
        });
    }
};

export function createEngine(config){
    const db = new PrismaClient({
        datasources:{
            db: {
                url: config.databaseUrl,
            },
        },
    });
    
    return new Engine({db});
}