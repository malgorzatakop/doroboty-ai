import { describe, expect, it } from "vitest";
import { initialState, transition } from "./model";
import { parseState, serializeState } from "./storage";
import {
  emptyExperienceCard,
  experienceCardSchema,
  CARD_ANSWER_LIMIT,
  cardAnswerKeys,
  countCardCharacters,
  type ExperienceCardDraft,
} from "./experience-card-model";

const complete: ExperienceCardDraft = {
  ...emptyExperienceCard,
  project: "Próba pomocy AI w odpowiedziach na reklamacje.",
  stage: "trial",
  contribution:
    "Przygotowałam instrukcję i sprawdziłam szkice. Prawniczka sprawdziła zasady. Efektu w obsłudze jeszcze nie zmierzono.",
  aiUse: "ChatGPT tworzy szkic. Samodzielnie dobieram informacje i sprawdzam zgodność z zasadami.",
};
const anna = () => transition(initialState(), { type: "select_person", id: "candidate-anna" });
const submit = (includeExperienceCard = true) => ({
  type: "submit" as const,
  jobId: initialState().jobs[0].id,
  answer: "Moje doświadczenie pasuje do tej roli w zespole produktowym.",
  notes: "",
  generated: "",
  consent: true,
  includeExperienceCard,
});

describe("reusable AI experience card", () => {
  it("limits new complete answers without truncating drafts or invalidating historical snapshots", () => {
    for (const key of cardAnswerKeys) {
      expect(
        experienceCardSchema.safeParse({ ...complete, [key]: "ą".repeat(CARD_ANSWER_LIMIT) })
          .success,
      ).toBe(true);
      expect(
        experienceCardSchema.safeParse({ ...complete, [key]: "ą".repeat(CARD_ANSWER_LIMIT + 1) })
          .success,
      ).toBe(false);
    }
    expect(countCardCharacters("  👍👍  ")).toBe(2);
    const long = { ...complete, project: "a".repeat(CARD_ANSWER_LIMIT + 1) };
    const draft = transition(anna(), { type: "experience_card", value: long, complete: false });
    expect(
      parseState(serializeState(draft)).people.find((p) => p.id === "candidate-anna")
        ?.experienceCard?.project,
    ).toBe(long.project);
    expect(() =>
      transition(draft, { type: "experience_card", value: long, complete: true }),
    ).toThrow();
    const historical = transition(
      transition(anna(), { type: "experience_card", value: complete, complete: true }),
      submit(),
    );
    historical.applications.at(-1)!.experienceCard!.project = long.project;
    expect(
      parseState(serializeState(historical)).applications.at(-1)?.experienceCard?.project,
    ).toBe(long.project);
  });
  it("accepts exactly three required answers with a stage and empty optional sections", () => {
    expect(experienceCardSchema.safeParse(complete).success).toBe(true);
    for (const key of ["project", "stage", "contribution", "aiUse"] as const) {
      expect(experienceCardSchema.safeParse({ ...complete, [key]: "  " }).success).toBe(false);
    }
  });
  it("keeps partial drafts across export/import but rejects attaching them", () => {
    const partial = { ...emptyExperienceCard, project: "Jeszcze opisuję projekt" };
    const state = transition(anna(), { type: "experience_card", value: partial, complete: false });
    const restored = parseState(serializeState(state));
    expect(restored.people.find((p) => p.id === "candidate-anna")?.experienceCard).toEqual(partial);
    expect(() => transition(restored, submit())).toThrow("Uzupełnij i zapisz");
    expect(() =>
      transition(restored, { type: "experience_card", value: partial, complete: true }),
    ).toThrow();
    expect(transition(restored, submit(false)).applications.at(-1)?.experienceCard).toBeUndefined();
  });
  it("snapshots the selected card and preserves it through profile edits, stage changes and serialization", () => {
    let state = transition(anna(), { type: "experience_card", value: complete, complete: true });
    state = transition(state, submit(), "2026-11-07T12:00:00.000Z", "card-application");
    state = transition(state, {
      type: "experience_card",
      value: { ...complete, contribution: "Nowy opis" },
      complete: true,
    });
    state = transition(state, { type: "select_person", id: "employer-brightlabs" });
    state = transition(state, {
      type: "stage",
      applicationId: "card-application",
      stage: "reviewed",
      note: "Do omówienia",
    });
    const restored = parseState(serializeState(state));
    expect(restored.applications.at(-1)?.experienceCard).toEqual(complete);
    expect(restored.applications.at(-1)?.score).toBe(
      initialState().people.find((p) => p.id === "candidate-anna")?.exampleScore,
    );
    expect(
      restored.people.find((p) => p.id === "candidate-anna")?.experienceCard?.contribution,
    ).toBe("Nowy opis");
  });
  it("keeps old v1 states compatible and never retroactively attaches a profile card", () => {
    const old = parseState(serializeState(anna()));
    const submitted = transition(old, submit(false));
    const changed = transition(submitted, {
      type: "experience_card",
      value: complete,
      complete: true,
    });
    expect(changed.applications.at(-1)?.experienceCard).toBeUndefined();
  });
  it("keeps cards person-specific and rejects writes from non-candidates", () => {
    const state = transition(anna(), { type: "experience_card", value: complete, complete: true });
    const marek = transition(state, { type: "select_person", id: "candidate-marek" });
    expect(
      transition(marek, { ...submit(false), jobId: marek.jobs[1].id }).people.find(
        (p) => p.id === "candidate-marek",
      )?.experienceCard,
    ).toBeUndefined();
    const employer = transition(state, { type: "select_person", id: "employer-brightlabs" });
    expect(() =>
      transition(employer, { type: "experience_card", value: complete, complete: true }),
    ).toThrow("kandydata");
  });
  it("rejects unsafe example links in complete cards and imported snapshots", () => {
    for (const workUrl of [
      "javascript:alert(1)",
      "data:text/html,hello",
      "//example.com",
      "https://user:password@example.com",
    ]) {
      expect(experienceCardSchema.safeParse({ ...complete, workUrl }).success).toBe(false);
    }
    const state = transition(
      transition(anna(), { type: "experience_card", value: complete, complete: true }),
      submit(),
    );
    state.applications.at(-1)!.experienceCard!.workUrl = "javascript:alert(1)";
    expect(() => parseState(serializeState(state))).toThrow("Nieprawidłowy plik");
    expect(
      experienceCardSchema.safeParse({ ...complete, workUrl: "https://example.com/work" }).success,
    ).toBe(true);
  });
});
