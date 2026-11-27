CREATE INDEX IF NOT EXISTS workflow_runs_pending_idx
ON workflow_runs (created_at, id)
WHERE status = 'PENDING';