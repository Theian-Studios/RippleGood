import { useCallback, useEffect, useState } from "react";

/**
 * A private record of what you've given, kept in this browser's localStorage
 * and nowhere else. No account, no server, no analytics call — Ripple Good cannot
 * see any of this, which is the same promise as the donate buttons: we are not
 * in the middle of your giving.
 *
 * Entries are self-reported. Nothing here is verified against a charity, and
 * the UI says so wherever a total is shown.
 */
const KEY = "ripple.tally.v1";

/** localStorage throws in private mode and when disabled — never crash the page over it. */
function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable or full: the tally is a convenience, not the product.
  }
}

/** Lets every mounted component re-read after any one of them writes. */
const listeners = new Set();

function broadcast() {
  listeners.forEach((fn) => fn());
}

export function useTally() {
  const [entries, setEntries] = useState(read);

  useEffect(() => {
    const sync = () => setEntries(read());
    listeners.add(sync);
    // Fires when the same site is open in another tab.
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((entry) => {
    const next = [
      ...read(),
      { ...entry, id: `${entry.causeId}-${Date.now()}`, at: new Date().toISOString() },
    ];
    write(next);
    broadcast();
  }, []);

  const remove = useCallback((id) => {
    write(read().filter((e) => e.id !== id));
    broadcast();
  }, []);

  const clear = useCallback(() => {
    write([]);
    broadcast();
  }, []);

  // A monthly gift counts as the year it adds up to — the same rule the
  // per-cause outcomes use. Mixing the two (a raw total against annualised
  // outcomes) made the headline figure disagree with the cards beneath it.
  const total = entries.reduce(
    (sum, e) => sum + (Number(e.amount) || 0) * (e.monthly ? 12 : 1),
    0,
  );
  const hasMonthly = entries.some((e) => e.monthly);

  return { entries, add, remove, clear, total, hasMonthly };
}
