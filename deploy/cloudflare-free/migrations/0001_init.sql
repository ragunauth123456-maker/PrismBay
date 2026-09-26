CREATE TABLE IF NOT EXISTS run_events (
  run_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('success','failure','cancelled')),
  finished_at TEXT NOT NULL,
  products INTEGER NOT NULL DEFAULT 0,
  catalog_updated_at TEXT
);
CREATE INDEX IF NOT EXISTS run_events_finished ON run_events(finished_at DESC);
CREATE TABLE IF NOT EXISTS task_requests (
  task_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('research_refresh','health_check')),
  status TEXT NOT NULL CHECK(status IN ('pending','completed')),
  created_at TEXT NOT NULL,
  completed_at TEXT,
  completed_by_run TEXT
);
CREATE INDEX IF NOT EXISTS tasks_pending ON task_requests(status,created_at);
