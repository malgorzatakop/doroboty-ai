export const BUILD_ID = typeof __APP_BUILD_ID__ === "string" ? __APP_BUILD_ID__ : "development";
const codes = new Set([
  "runtime-error",
  "resource-load-failed",
  "unhandled-rejection",
  "render-error",
  "recoverable-render-error",
  "storage-read-failed",
  "storage-write-failed",
  "import-rejected",
]);
export type DiagnosticCode =
  | "runtime-error"
  | "resource-load-failed"
  | "unhandled-rejection"
  | "render-error"
  | "recoverable-render-error"
  | "storage-read-failed"
  | "storage-write-failed"
  | "import-rejected";

export function createDiagnostics(buildId: string) {
  const events: { code: DiagnosticCode; at: string }[] = [];
  return {
    record(code: DiagnosticCode) {
      // Validate at runtime too: no caller-supplied text enters the report.
      if (!codes.has(code)) return;
      events.push({ code, at: new Date().toISOString() });
      if (events.length > 20) events.shift();
    },
    snapshot() {
      return { version: 1, buildId, events: events.map((event) => ({ ...event })) };
    },
  };
}
const diagnostics = createDiagnostics(BUILD_ID);
export const recordDiagnostic = diagnostics.record;
export const diagnosticSnapshot = diagnostics.snapshot;

export function installRuntimeDiagnostics(target: Window) {
  const error = (event: Event) =>
    recordDiagnostic(event.target === target ? "runtime-error" : "resource-load-failed");
  const rejection = () => recordDiagnostic("unhandled-rejection");
  target.addEventListener("error", error, true);
  target.addEventListener("unhandledrejection", rejection);
  return () => {
    target.removeEventListener("error", error, true);
    target.removeEventListener("unhandledrejection", rejection);
  };
}
