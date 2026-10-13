import { useSyncExternalStore } from 'react';

/*
 * Intro loader state, shared by the overlay and the page under it.
 *   running  - overlay is up, the page is aria-hidden and the hero is held back
 *   exiting  - the panels are sliding away, the hero is arriving
 *   done     - overlay removed (also the start state for return visits in the same session)
 */

const KEY = 'portfolio-intro-seen';
const listeners = new Set();
let phase = null;

function seenThisSession() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage blocked: the intro simply plays again next time */
  }
}

function getPhase() {
  if (phase === null) phase = seenThisSession() ? 'done' : 'running';
  return phase;
}

export function setIntroPhase(next) {
  phase = next;
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// The server and the first client render both say "running", so hydration matches.
export function useIntroPhase() {
  return useSyncExternalStore(subscribe, getPhase, () => 'running');
}
