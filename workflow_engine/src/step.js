import * as stepQueries from "../queries/runStep.queries.js";

export function createStepRunner(runId){
    const counts = new Map();

    function nextKey(name){
        const idx = counts.get(name) ?? 0;
        counts.set(name, idx + 1);
        return `${name}-${idx}`;
    }

    return {
        async run(name, fn){
            if(!name || typeof fn !== "function"){
                throw new Error("Run requires a name and a function.");
            }

            const stepKey = nextKey(name);

            const existing = await stepQueries.findRunStep(runId, stepKey);
            if(existing && existing.status === "COMPLETED"){
                return existing.output;
            };

            await stepQueries.modifyRunSteps(runId, stepKey);

            try{
                const result = await fn();
                await stepQueries.successfulRunStep(runId, stepKey, result);
                return result;
            }
            catch(err){
                await stepQueries.errorProneRunStep(runId, stepKey, err);
                throw err;
            }
        }
    };
};