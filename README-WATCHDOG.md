# Production watchdog

`publish.sh` starts `scripts/watchdog.sh` after the production server answers on port 3000. The watchdog is a small, idempotent shell supervisor:

- checks `http://127.0.0.1:3000/` every five seconds;
- starts `bun run start` directly when the server is down (no rebuild, so recovery is fast and low-memory);
- uses exponential retry backoff up to 60 seconds when startup repeatedly fails;
- records supervisor events in `.run/watchdog.log` and server output in `.run/server.log`.

A second watchdog invocation exits if the recorded watchdog PID is still alive, so normal `bun run publish` calls do not create duplicate supervisors. Manual publishing remains safe: `serve.ts` takes ownership of port 3000, and the existing publish wait then ensures the watchdog is running.

The watchdog is intentionally launched with `setsid`/`nohup` by `publish.sh`, so it survives the publishing shell. This environment does not run a system cron daemon, so the watchdog is started by each successful publish. If the whole machine/container restarts, run the normal publish bootstrap to start the site and supervisor.

Useful checks:

```sh
ps aux | grep '[w]atchdog.sh'
curl -I http://localhost:3000/
tail -f .run/watchdog.log .run/server.log
```
