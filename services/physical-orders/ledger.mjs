import { mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export async function openLedger(directory) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const lockPath = join(directory, 'writer.lock');
  const lock = await open(lockPath, 'wx', 0o600);
  let state;
  try {
    try { state = JSON.parse(await readFile(join(directory, 'ledger.json'), 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; state = { version: 1, events: {}, orders: {} }; }
    if (state.version !== 1 || !state.events || !state.orders) throw Error('Invalid ledger');
  } catch (error) { await lock.close(); await unlink(lockPath); throw error; }
  let tail = Promise.resolve();
  let poisoned = false;
  return {
    snapshot: () => structuredClone(state),
    transact(fn) {
      const operation = tail.then(async () => {
        if (poisoned) throw Error('Ledger requires restart');
        const next = structuredClone(state);
        const result = fn(next);
        const temp = join(directory, `ledger-${randomUUID()}.tmp`);
        try {
          const file = await open(temp, 'wx', 0o600);
          try { await file.writeFile(JSON.stringify(next)); await file.sync(); } finally { await file.close(); }
          await rename(temp, join(directory, 'ledger.json'));
          if (process.platform !== 'win32') {
            const dir = await open(directory, 'r');
            try { await dir.sync(); } finally { await dir.close(); }
          }
          state = next;
        } catch (error) { poisoned = true; throw error; }
        return result;
      });
      tail = operation.catch(() => {});
      return operation;
    },
    async close() { await tail; await lock.close(); await unlink(lockPath); },
  };
}
