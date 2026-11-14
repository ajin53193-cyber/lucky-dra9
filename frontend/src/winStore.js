// Persist wins locally so a closed / refreshed win modal can be reopened and the
// entered account ID is not lost. Shape: { [code]: { amount, account_id, submitted, ts } }
const KEY = "gset_win";

export const readWins = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
};

export const getWin = (code) => (code ? readWins()[code] || null : null);

export const saveWin = (code, patch) => {
  if (!code) return;
  const all = readWins();
  all[code] = { ...(all[code] || {}), ...patch, ts: all[code]?.ts || Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage full / disabled */ }
};

// most recent win that has not been submitted yet
export const latestPendingWin = () => {
  const all = readWins();
  const pending = Object.entries(all)
    .filter(([, w]) => w && !w.submitted && typeof w.amount === "number")
    .sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
  return pending.length ? { code: pending[0][0], amount: pending[0][1].amount } : null;
};
