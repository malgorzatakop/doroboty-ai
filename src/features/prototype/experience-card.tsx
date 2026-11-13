import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currentPerson } from "./model";
import { usePrototype } from "./store";
import annaCardExample from "./data/anna-experience-card.json";
import {
  cardQuestions,
  CARD_ANSWER_LIMIT,
  countCardCharacters,
  emptyExperienceCard,
  experienceCardSchema,
  projectStages,
  type ExperienceCard,
  type ExperienceCardDraft,
} from "./experience-card-model";

/** One reader for profile, application review and both submitted-record audiences. */
export function ExperienceCardContent({ card }: { card: ExperienceCard }) {
  return (
    <div className="experience-reading">
      {cardQuestions.map(({ key, title }, index) => {
        if (index > 2 && !card[key] && !(key === "workExample" && card.workUrl)) return null;
        return (
          <section key={key}>
            <h3>{title}</h3>
            {key === "project" && (
              <span className="experience-stage">Etap: {projectStages[card.stage]}</span>
            )}
            {card[key] && <p>{card[key]}</p>}
            {key === "workExample" && card.workUrl && (
              <a
                href={card.workUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="experience-work-link"
              >
                Zobacz przykład pracy <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function ExperienceCardProfile({ preview = false }: { preview?: boolean }) {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const parsed = experienceCardSchema.safeParse(person.experienceCard);
  return (
    <section className="prototype-panel experience-profile" aria-labelledby="profile-card-title">
      <div className="experience-profile-heading">
        <div>
          <p className="experience-eyebrow">Twoje doświadczenie w praktyce</p>
          <h2 id="profile-card-title">Karta doświadczenia z AI</h2>
        </div>
        <span className="experience-stage">
          {parsed.success
            ? "Gotowa do dołączenia"
            : person.experienceCard
              ? "Szkic"
              : "Jeszcze bez karty"}
        </span>
      </div>
      {preview && parsed.success ? (
        <ExperienceCardContent card={parsed.data} />
      ) : (
        <p>
          Jeden projekt, Twój wkład i sposób pracy z AI. Przygotuj kartę raz i dołączaj ją do
          wybranych aplikacji.
        </p>
      )}
      <Link
        to="/app/profil/karta"
        className={buttonVariants({ variant: parsed.success ? "outline" : "default" })}
      >
        {person.experienceCard ? "Edytuj kartę" : "Utwórz kartę"}
      </Link>
    </section>
  );
}

export function ExperienceCardPage() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  return (
    <ExperienceCardEditor key={person.id} initial={person.experienceCard ?? emptyExperienceCard} />
  );
}

function ExperienceCardEditor({ initial }: { initial: ExperienceCardDraft }) {
  const { state, run, issue } = usePrototype();
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [optionalOpen, setOptionalOpen] = useState(true);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const complete = experienceCardSchema.safeParse(value);
  const canLoadExample =
    currentPerson(state)?.id === "candidate-anna" &&
    Object.values(value).every((part) => !part.trim());
  const answered = [
    Boolean(value.project.trim() && value.stage),
    Boolean(value.contribution.trim()),
    Boolean(value.aiUse.trim()),
  ].filter(Boolean).length;

  function change(key: keyof ExperienceCardDraft, next: string) {
    setValue((old) => ({ ...old, [key]: next }));
    setDirty(true);
    setMessage("");
    setErrors((old) => ({ ...old, [key]: "" }));
  }
  function validate() {
    const result = experienceCardSchema.safeParse(value);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const item of result.error.issues) next[String(item.path[0])] ??= item.message;
    setErrors(next);
    if (next.workUrl) setOptionalOpen(true);
    // Commit the error/disclosure before focusing the first invalid field.
    requestAnimationFrame(() =>
      formRef.current?.querySelector<HTMLElement>(`[id="card-${Object.keys(next)[0]}"]`)?.focus(),
    );
    return false;
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    if (run({ type: "experience_card", value, complete: true })) {
      setDirty(false);
      setMessage("Karta jest gotowa do dołączenia do aplikacji.");
    }
  }
  function answerField(index: number) {
    const { key, title, question, hint } = cardQuestions[index];
    const required = index < 3;
    const length = countCardCharacters(value[key]);
    const overLimit = length > CARD_ANSWER_LIMIT;
    return (
      <section className="experience-question" key={key}>
        <div className="experience-question-heading">
          <span className="experience-number" aria-hidden="true">
            {index + 1}
          </span>
          <h2>
            <label htmlFor={`card-${key}`}>{title}</label>
          </h2>
          <span className="experience-requirement">{required ? "Obowiązkowe" : "Opcjonalnie"}</span>
        </div>
        <p id={`card-${key}-question`} className="experience-prompt">
          {question}
        </p>
        <Textarea
          id={`card-${key}`}
          required={required}
          rows={4}
          value={value[key]}
          aria-describedby={`card-${key}-question card-${key}-hint card-${key}-count${errors[key] ? ` card-${key}-error` : ""}`}
          aria-invalid={Boolean(errors[key]) || overLimit || undefined}
          onChange={(event) => change(key, event.target.value)}
        />
        <p
          id={`card-${key}-count`}
          className={`experience-character-count${overLimit ? " experience-character-count-over" : ""}`}
        >
          <span>Maksymalnie {CARD_ANSWER_LIMIT} znaków</span>
          <span>
            {length} / {CARD_ANSWER_LIMIT}
          </span>
          {overLimit && (
            <span className="experience-character-excess">
              Skróć odpowiedź o {length - CARD_ANSWER_LIMIT} znaków przed zapisaniem gotowej karty.
            </span>
          )}
        </p>
        <p id={`card-${key}-hint`} className="experience-hint">
          {hint}
        </p>
        {errors[key] && (
          <p id={`card-${key}-error`} className="error-message" role="alert">
            {errors[key]}
          </p>
        )}
        {key === "project" && (
          <div className="experience-stage-field">
            <label htmlFor="card-stage">Etap projektu</label>
            <select
              id="card-stage"
              className="native-select"
              required
              value={value.stage}
              aria-invalid={Boolean(errors.stage) || undefined}
              aria-describedby={errors.stage ? "card-stage-error" : undefined}
              onChange={(event) => change("stage", event.target.value)}
            >
              <option value="">Wybierz etap</option>
              {Object.entries(projectStages).map(([key, label]) => (
                <option value={key} key={key}>
                  {label}
                </option>
              ))}
            </select>
            {errors.stage && (
              <p id="card-stage-error" className="error-message" role="alert">
                {errors.stage}
              </p>
            )}
          </div>
        )}
        {key === "workExample" && (
          <div className="experience-stage-field">
            <label htmlFor="card-workUrl">Link do przykładu pracy (opcjonalnie)</label>
            <Input
              id="card-workUrl"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={value.workUrl}
              aria-invalid={Boolean(errors.workUrl) || undefined}
              aria-describedby={errors.workUrl ? "card-workUrl-error" : undefined}
              onChange={(event) => change("workUrl", event.target.value)}
            />
            {errors.workUrl && (
              <p id="card-workUrl-error" className="error-message" role="alert">
                {errors.workUrl}
              </p>
            )}
          </div>
        )}
      </section>
    );
  }
  return (
    <section className="experience-page">
      <BackLink to="/app/profil">Wróć do profilu</BackLink>
      <header className="experience-header">
        <p className="experience-eyebrow">Jeden projekt. Twój wkład.</p>
        <h1>Karta doświadczenia z AI</h1>
        <p>
          Za Twoim CV stoi konkretna praca — pokaż ją. Opisz jeden projekt z AI i swój wkład, żeby
          rekruter mógł lepiej poznać Twoje umiejętności. To może być dobry powód, żeby zaprosić Cię
          na rozmowę. Nie musisz podawać poufnych informacji — opisz projekt i swój wkład w ogólny
          sposób.
        </p>
      </header>
      <div className="experience-layout">
        <form
          ref={formRef}
          className="record-sheet experience-form"
          noValidate
          onSubmit={save}
          aria-label="Karta doświadczenia z AI"
        >
          <div className="experience-editor-heading">
            <span>{preview ? "Podgląd karty" : "Trzy odpowiedzi wystarczą"}</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (preview) {
                  setPreview(false);
                  return;
                }
                if (validate()) setPreview(true);
              }}
            >
              {preview ? "Wróć do edycji" : "Podgląd karty"}
            </Button>
          </div>
          {canLoadExample && (
            <div className="mb-6 space-y-3">
              <p className="experience-hint">
                Fikcyjny przykład dla Anny Kowalskiej. Wczytaj gotowe odpowiedzi, aby zobaczyć kartę
                w podglądzie.
              </p>
              <Button
                type="button"
                variant="outline"
                className="max-w-full whitespace-normal"
                onClick={() => {
                  const example = experienceCardSchema.parse(annaCardExample);
                  if (run({ type: "experience_card", value: example, complete: true })) {
                    setValue(example);
                    setErrors({});
                    setDirty(false);
                    setPreview(true);
                    setMessage(
                      "Wczytano przykładową kartę Anny Kowalskiej. Jest gotowa do dołączenia do aplikacji.",
                    );
                  }
                }}
              >
                Wczytaj przykładową kartę
              </Button>
            </div>
          )}
          {preview && complete.success ? (
            <ExperienceCardContent card={complete.data} />
          ) : (
            <>
              {[0, 1, 2].map(answerField)}
              <div className="experience-optional">
                <Button
                  type="button"
                  variant="outline"
                  aria-expanded={optionalOpen}
                  aria-controls="card-optional-fields"
                  onClick={() => setOptionalOpen(!optionalOpen)}
                >
                  <span className="experience-optional-label">
                    <span>Chcesz dodać coś więcej?</span>
                    <span>Opcjonalnie</span>
                  </span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={optionalOpen ? "rotate-180" : undefined}
                  />
                </Button>
                <p>
                  Te pytania są opcjonalne. Dodatkowy przykład pracy i wyciągnięta lekcja mogą
                  wyróżnić Twoją kandydaturę i pomóc Ci zrobić kolejny krok w stronę zatrudnienia.
                </p>
                <div id="card-optional-fields" hidden={!optionalOpen}>
                  {[3, 4].map(answerField)}
                </div>
              </div>
            </>
          )}
          <footer className="record-footer experience-footer">
            <div className="record-actions">
              <Button type="submit">Zapisz kartę</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (run({ type: "experience_card", value, complete: false })) {
                    setDirty(false);
                    setMessage("Szkic karty jest zachowany. Możesz wrócić do niego w profilu.");
                  }
                }}
              >
                Zapisz szkic karty
              </Button>
            </div>
            <p role="status">
              {message &&
                (issue
                  ? "Zmiany są w pamięci. Zapis w przeglądarce jest niedostępny — wyeksportuj dane w ustawieniach."
                  : message)}
            </p>
            <p className="experience-hint">
              {dirty
                ? "Masz niezapisane zmiany."
                : "Przed opuszczeniem formularza zapisz kartę lub jej szkic."}
            </p>
          </footer>
        </form>
        <aside className="experience-aside" aria-label="Wskazówki do karty">
          <div className="experience-progress">
            <Check size={18} aria-hidden="true" /> {answered} z 3 odpowiedzi gotowych
          </div>
          <h2>
            Zapisujesz raz.
            <br />
            Korzystasz ponownie.
          </h2>
          <p>
            Tę samą kartę możesz wykorzystać w różnych rekrutacjach. Przed wysłaniem zdecydujesz,
            czy ją dołączyć.
          </p>
          <div className="experience-aside-note">
            <h3>Próba też się liczy</h3>
            <p>
              Możesz opisać projekt własny, edukacyjny albo z pracy. Powiedz, co zrobiłeś lub
              zrobiłaś i czego jeszcze nie sprawdzono.
            </p>
          </div>
          <p>Zmiana karty w profilu nie zmienia kopii wysłanych wcześniej pracodawcom.</p>
        </aside>
      </div>
    </section>
  );
}
