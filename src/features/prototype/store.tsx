import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { initialState, transition, type Action, type State } from "./model";
import { parseState, readState, saveState, STORAGE_KEY, type StoragePort } from "./storage";
import { retainRecoverySnapshot } from "./recovery-snapshot";
function browserStorage(): StoragePort | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function useStore() {
  const [loaded] = useState(() => {
    const result = readState(browserStorage());
    retainRecoverySnapshot(result.state);
    return result;
  });
  const [state, setState] = useState(loaded.state);
  const [issue, setIssue] = useState(loaded.issue);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(loaded.blocked);
  const latest = useRef(state);
  const lastSaved = useRef(loaded.raw);
  const permission = useRef<"waiting" | "ready" | "conflict" | "unavailable">("waiting");
  const [writeIssue, setWriteIssue] = useState(
    "Zapis tej karty czeka na dostęp. Jeśli edytujesz w innej karcie, zamknij ją. Tutejsze zmiany możesz zachować przez eksport w ustawieniach.",
  );
  const conflictMessage =
    "Inna karta zmieniła zapisany scenariusz. Ta karta nie nadpisze jej danych. Wyeksportuj tutejsze zmiany w ustawieniach, a potem odśwież stronę, aby wczytać aktualny zapis.";
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let release: (() => void) | undefined;
    async function acquire() {
      // Yield so StrictMode can cancel a disposed mount before acquiring the lock.
      await Promise.resolve();
      if (!active) return;
      if (!navigator.locks) {
        permission.current = "unavailable";
        setWriteIssue(
          "Ta przeglądarka nie obsługuje bezpiecznego zapisu między kartami. Zmiany pozostają w pamięci. Wyeksportuj je przed zamknięciem strony albo użyj aktualnej przeglądarki pod adresem HTTPS.",
        );
        return;
      }
      try {
        await navigator.locks.request(
          `${STORAGE_KEY}.writer`,
          { signal: controller.signal },
          async () => {
            if (!active) return;
            const storage = browserStorage();
            let changed = false;
            try {
              changed = !!storage && storage.getItem(STORAGE_KEY) !== lastSaved.current;
            } catch {
              // Existing storage-error handling keeps edits exportable in memory.
            }
            if (changed) {
              permission.current = "conflict";
              setWriteIssue(conflictMessage);
              return;
            }
            permission.current = "ready";
            setWriteIssue("");
            await new Promise<void>((resolve) => {
              release = resolve;
            });
          },
        );
      } catch {
        if (active) {
          permission.current = "unavailable";
          setWriteIssue(
            "Bezpieczny zapis jest niedostępny. Zmiany pozostają w pamięci; wyeksportuj je przed zamknięciem strony.",
          );
        }
      }
    }
    void acquire();
    return () => {
      active = false;
      permission.current = "waiting";
      controller.abort();
      release?.();
    };
  }, []);
  function commit(next: State, replace = false) {
    latest.current = next;
    retainRecoverySnapshot(next);
    setState(next);
    setError("");
    if (blocked && !replace) return;
    if (permission.current !== "ready") return;
    try {
      const storage = browserStorage();
      if (storage && storage.getItem(STORAGE_KEY) !== lastSaved.current) {
        permission.current = "conflict";
        setWriteIssue(conflictMessage);
        return;
      }
      saveState(storage, next);
      lastSaved.current = storage?.getItem(STORAGE_KEY) ?? null;
      setIssue("");
      if (replace) setBlocked(false);
    } catch (e) {
      setIssue((e as Error).message);
    }
  }
  function run(action: Action) {
    try {
      commit(transition(latest.current, action));
      return true;
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "ZodError"
          ? e.message
          : "Sprawdź poprawność i długość wprowadzonych danych.",
      );
      return false;
    }
  }
  function importState(raw: string) {
    try {
      const next = parseState(raw);
      commit(next, true);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  return {
    state,
    issue: [writeIssue, issue].filter(Boolean).join(" "),
    error,
    blocked,
    original: loaded.original,
    run,
    importState,
    clearError: () => setError(""),
    reset: () => commit(initialState(), true),
  };
}
type Store = ReturnType<typeof useStore>;
const Context = createContext<Store | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function usePrototype() {
  const store = useContext(Context);
  if (!store) throw new Error("PrototypeProvider is required");
  return store;
}
