import { claimNextRun, executeClaimedRun } from "./executor.js";

export class Worker {
    constructor(engine, {pollIntervalMs = 500, concurrency = 4} = {}){
        this.engine = engine;
        this.pollIntervalMs = pollIntervalMs;

        //handling concurrency
        this.concurrency = concurrency;
        this.inFlight = new Set();

        //handling start stop
        this.running = false;
        this.timer = null;
    }

    start(){
        if(this.running)return;
        this.running = true;
        this.scheduleNext(0);
    }

    async stop(){
        if(!this.running)return;
        this.running = false;
        if(this.timer){
            clearTimeout(this.timer);
            this.timer = null;
        }
        await Promise.allSettled([...this.inFlight]);
    }

    scheduleNext(delayMs = this.pollIntervalMs){
        if(!this.running)return;
        this.timer = setTimeout(() =>{
            this.tick();
            this.scheduleNext(this.pollIntervalMs);
        }, delayMs);
    }

    async tick(){
        while(this.running && this.inFlight.size < this.concurrency){
            const run = await claimNextRun(this.engine.db);
            if(!run) return;

            //since we dont use await with executeClaimedRun, it runs concurrently and doesn't pause execution.
            const job = executeClaimedRun(this.engine, run)
                                          .finally(() =>{
                                            this.inFlight.clear(job);
                                          });
            this.inFlight.add(job);
        };
    };
};