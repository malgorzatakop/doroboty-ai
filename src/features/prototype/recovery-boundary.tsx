import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { downloadText } from "@/lib/download-text";
import { diagnosticSnapshot } from "./diagnostics";
import { recoverySnapshot } from "./recovery-snapshot";
import { STORAGE_KEY, serializeState } from "./storage";

export class RecoveryBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const scenario = recoverySnapshot();
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // An unavailable browser save must not hide the in-memory export.
    }
    return (
      <main className="prototype-section">
        <section className="prototype-panel prototype-form">
          <div role="alert">
            <h1>Nie udało się wyświetlić prototypu</h1>
          </div>
          <p>
            Najpierw wyeksportuj dane z tej karty, aby zachować również zmiany, których przeglądarka
            nie zdołała zapisać. Potem pobierz diagnostykę i przekaż ją osobie, od której masz link.
            Eksport scenariusza zachowaj dla siebie.
          </p>
          <p>Odświeżenie wczyta ostatni zapis z przeglądarki. Dane nie zostaną zresetowane.</p>
          <div className="flex flex-wrap gap-3">
            {scenario && (
              <Button
                variant="outline"
                onClick={() =>
                  downloadText("doroboty-scenariusz-do-odzyskania.json", serializeState(scenario))
                }
              >
                Eksportuj dane z tej karty
              </Button>
            )}
            {stored !== null && (
              <Button
                variant="outline"
                onClick={() => downloadText("doroboty-ostatni-zapis.txt", stored, "text/plain")}
              >
                Pobierz ostatni zapis
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() =>
                downloadText(
                  "doroboty-diagnostyka.json",
                  JSON.stringify(diagnosticSnapshot(), null, 2),
                )
              }
            >
              Pobierz diagnostykę
            </Button>
            <Button onClick={() => window.location.reload()}>Odśwież prototyp</Button>
          </div>
          <p>
            Diagnostyka zawiera tylko wersję aplikacji, kody zdarzeń i ich czas. Jest przechowywana
            w pamięci tej karty do odświeżenia.
          </p>
        </section>
      </main>
    );
  }
}
