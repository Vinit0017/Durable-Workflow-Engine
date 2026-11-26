##Run state machine

PENDING --claim--> RUNNING --+--> COMPLETED
                           --+--> FAILED (non-retriable or exhausted)
                           --+--> SLEEPING step.sleep wake_at reached -> PENDING
                           --+--> RETRY_WAIT step failed wake_at reached -> PENDING
                           --+--> WAITING_EVENT waitForEvent event or deadline -> PENDING
                           --+--> lease expires: reaper returns it to PENDING
any non-terminal state --cancel--> CANCELLED (cooperative if currently RUNNING)

##Schema

-workflow_runs(id, workflow_name, version, status, input jsonb, output jsonb, error,
idempotency_key, priority, concurrency_key, wake_at timestamptz,
lease_owner, lease_expires_at, recovery_count, cancel_requested,
created_at, updated_at, UNIQUE(workflow_name, idempotency_key))

-run_steps(run_id, step_key, seq, type, status, output jsonb, error, attempt,
next_attempt_at, started_at, finished_at, UNIQUE(run_id, step_key))

-run_step_attempts(id, run_id, step_key, attempt, worker_id, started_at, finished_at, error)

-events(id, name, payload jsonb, idempotency_key UNIQUE, received_at)

-event_waits(run_id, step_key, event_name, match_value, deadline, status)


##Failure Cases

1. Worker dies midway through a step.
2. Database restarts
3. Two workers claim the same run
4. Worker crashes after side effects but before recroding completion
5. Activity throws an error
6. Worker crashes after step completion
7. Run gets stuck in running
8. Workflow input invalid
9. User cancels workflow
10. Database write fails after activity execution.