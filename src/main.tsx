import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import "./app/globals.css";
import { RecoveryBoundary } from "./features/prototype/recovery-boundary";
import { installRuntimeDiagnostics, recordDiagnostic } from "./features/prototype/diagnostics";
installRuntimeDiagnostics(window);
createRoot(document.getElementById("root")!, {
  onCaughtError: () => recordDiagnostic("render-error"),
  onUncaughtError: () => recordDiagnostic("runtime-error"),
  onRecoverableError: () => recordDiagnostic("recoverable-render-error"),
}).render(
  <StrictMode>
    <RecoveryBoundary>
      <App />
    </RecoveryBoundary>
  </StrictMode>,
);
