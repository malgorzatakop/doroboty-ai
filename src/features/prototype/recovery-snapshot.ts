import type { State } from "./model";

// Separate from diagnostics: this is the existing scenario, retained only in
// memory so a render crash cannot destroy the user's only exportable copy.
let snapshot: State | null = null;
export function retainRecoverySnapshot(state: State) {
  snapshot = state;
}
export function recoverySnapshot() {
  return snapshot;
}
