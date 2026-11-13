import { describe, expect, it } from "vitest";
import { createDiagnostics, type DiagnosticCode } from "./diagnostics";

describe("private local diagnostics", () => {
  it("rejects arbitrary text and exposes only a fixed code, timestamp and build identity", () => {
    const recorder = createDiagnostics("test-build");
    recorder.record("candidate answer, token, URL" as DiagnosticCode);
    recorder.record("runtime-error");
    const report = recorder.snapshot();
    expect(Object.keys(report).sort()).toEqual(["buildId", "events", "version"]);
    expect(report.events).toHaveLength(1);
    expect(Object.keys(report.events[0]).sort()).toEqual(["at", "code"]);
    expect(report.events[0].code).toBe("runtime-error");
    expect(Number.isNaN(Date.parse(report.events[0].at))).toBe(false);
    expect(JSON.stringify(report)).not.toContain("candidate answer");
  });
  it("bounds repeated failures and prevents an exported snapshot from changing live diagnostics", () => {
    const recorder = createDiagnostics("test-build");
    for (let index = 0; index < 100; index++) recorder.record("storage-write-failed");
    const exported = recorder.snapshot();
    expect(exported.events).toHaveLength(20);
    exported.events[0].code = "render-error";
    exported.events.length = 0;
    expect(recorder.snapshot().events).toHaveLength(20);
    expect(recorder.snapshot().events[0].code).toBe("storage-write-failed");
  });
});
