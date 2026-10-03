export function normalizeRotationSlot(value, now = Date.now()) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 0) return parsed;
  return Math.floor(now / 3600000);
}

export function selectRotatingCandidates(candidates, options = {}) {
  const rows = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  const batchSize = Math.max(1, Math.min(rows.length || 1, Number(options.batchSize) || 5));
  const anchorCount = Math.max(0, Math.min(batchSize, rows.length, Number(options.anchorCount ?? 2)));
  const slot = normalizeRotationSlot(options.slot, options.now);
  if (rows.length <= batchSize) {
    return {
      selected: rows,
      slot,
      batchSize: rows.length,
      anchorCount: Math.min(anchorCount, rows.length),
      rotatingPoolSize: 0,
      offset: 0,
    };
  }

  const anchors = rows.slice(0, anchorCount);
  const pool = rows.slice(anchorCount);
  const rotatingSlots = Math.max(0, batchSize - anchors.length);
  const offset = pool.length ? slot % pool.length : 0;
  const rotating = [];
  for (let i = 0; i < rotatingSlots && i < pool.length; i += 1) {
    rotating.push(pool[(offset + i) % pool.length]);
  }
  const seen = new Set();
  const selected = [...anchors, ...rotating].filter(row => {
    const key = String(row?.slug || row?.name || JSON.stringify(row));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    selected,
    slot,
    batchSize: selected.length,
    anchorCount: anchors.length,
    rotatingPoolSize: pool.length,
    offset,
  };
}
