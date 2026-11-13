import { z } from "zod";

export const CARD_ANSWER_LIMIT = 1000;
export const cardAnswerKeys = [
  "project",
  "contribution",
  "aiUse",
  "workExample",
  "lesson",
] as const;
export const countCardCharacters = (value: string) => Array.from(value.trim()).length;

export const projectStages = {
  idea: "Pomysł",
  trial: "Próba",
  in_use: "Używane w praktyce",
  finished: "Zakończone",
} as const;

export const experienceCardDraftSchema = z.object({
  project: z.string().trim(),
  stage: z.enum(["", "idea", "trial", "in_use", "finished"]),
  contribution: z.string().trim(),
  aiUse: z.string().trim(),
  workExample: z.string().trim(),
  workUrl: z.string().trim(),
  lesson: z.string().trim(),
});

// Read historical snapshots without imposing a new limit on already-submitted data.
export const experienceCardSnapshotSchema = experienceCardDraftSchema.extend({
  project: z.string().trim().min(1, "Opisz projekt lub produkt z wykorzystaniem AI."),
  stage: z.enum(["idea", "trial", "in_use", "finished"], { error: "Wybierz etap projektu." }),
  contribution: z.string().trim().min(1, "Opisz swój wkład i efekt pracy."),
  aiUse: z.string().trim().min(1, "Opisz, jak korzystasz z narzędzi AI w pracy."),
  workUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
      } catch {
        return false;
      }
    }, "Podaj pełny link zaczynający się od https:// lub http://, albo pozostaw pole puste."),
});

export const experienceCardSchema = experienceCardSnapshotSchema.superRefine((card, context) => {
  for (const key of cardAnswerKeys) {
    if (countCardCharacters(card[key]) > CARD_ANSWER_LIMIT) {
      context.addIssue({
        code: "custom",
        path: [key],
        message: `Skróć odpowiedź do ${CARD_ANSWER_LIMIT} znaków. Dłuższą wersję możesz zachować jako szkic.`,
      });
    }
  }
});

export type ExperienceCardDraft = z.infer<typeof experienceCardDraftSchema>;
export type ExperienceCard = z.infer<typeof experienceCardSchema>;
export const emptyExperienceCard: ExperienceCardDraft = {
  project: "",
  stage: "",
  contribution: "",
  aiUse: "",
  workExample: "",
  workUrl: "",
  lesson: "",
};

export const cardQuestions = [
  {
    key: "project",
    title: "Projekt lub produkt z wykorzystaniem AI",
    question:
      "Nad czym pracowałeś lub pracowałaś? Jaki problem rozwiązywaliście — co miało się poprawić i dla kogo? Krótko opisz, do czego wykorzystano AI.",
    hint: "Możesz opisać projekt ogólnie, np. „pomoc w przygotowaniu odpowiedzi na reklamacje w firmie usługowej”.",
  },
  {
    key: "contribution",
    title: "Twój wkład i efekt pracy",
    question:
      "Na czym polegała Twoja rola? Podaj 2–3 konkretne działania i opisz, co dzięki nim powstało lub się zmieniło.",
    hint: "Przy pracy zespołowej krótko zaznacz, co zrobiłeś lub zrobiłaś osobiście, a co wykonali inni. Jeśli efekt nie został jeszcze sprawdzony, zaznacz to — liczby nie są wymagane.",
  },
  {
    key: "aiUse",
    title: "Jak korzystasz z narzędzi AI w pracy",
    question:
      "Jakich narzędzi AI używasz i do jakich zadań? Podaj jeden konkretny przykład: co powierzasz AI, co robisz samodzielnie i jak sprawdzasz wynik.",
    hint: "Wystarczą 2–3 zdania. Przykład może dotyczyć opisanego projektu albo innego zadania w Twojej pracy. Jeśli dopiero próbujesz takich narzędzi, możesz opisać próbę. Nie musisz wymieniać wszystkich narzędzi.",
  },
  {
    key: "workExample",
    title: "Przykład Twojej pracy",
    question:
      "Czy chcesz pokazać przykład swojej pracy? Dodaj link lub materiał i krótko wskaż, co zrobiłeś lub zrobiłaś w pokazanym fragmencie.",
    hint: "Może to być zanonimizowany dokument, analiza, instrukcja, zrzut ekranu, fragment kodu lub inny materiał. Możesz wkleić link do materiału i opisać swój wkład. Jeśli nie możesz go udostępnić, pomiń to pole.",
  },
  {
    key: "lesson",
    title: "Trudność i wyciągnięta lekcja",
    question:
      "Co nie zadziałało lub okazało się najtrudniejsze? Co zrobiłeś lub zrobiłaś w tej sytuacji i czego Cię to nauczyło?",
    hint: "Opcjonalnie, wystarczą 2–3 zdania. Możesz odnieść się do opisanego projektu. Nie musi to być duża trudność — ważny jest konkretny przykład Twojej reakcji i lekcji na przyszłość.",
  },
] as const;
