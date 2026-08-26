import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { QUESTIONS, scoreQuiz } from "../lib/quiz.js";
import { getCharityById } from "../data/charities.js";
import { iconFor } from "../lib/icons.js";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function Quiz() {
  usePageMeta(
    "Find your cause",
    "Four questions about what you value, ending at the cause — and the charity — that best fits your answers.",
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => QUESTIONS.map(() => null));

  const done = step >= QUESTIONS.length;
  const ranked = done ? scoreQuiz(answers) : [];
  const top = done ? getCharityById(ranked[0]?.id) : null;
  const runnerUp = done ? getCharityById(ranked[1]?.id) : null;

  function choose(optionIndex) {
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);
    setStep(step + 1);
  }

  function restart() {
    setAnswers(QUESTIONS.map(() => null));
    setStep(0);
  }

  if (done && top) {
    const TopIcon = iconFor(top.icon);
    return (
      <section className="pageHead">
        <div className="wrap wrap--narrow">
          <p className="eyebrow">Your answers point to</p>

          <div className="quizResult">
            <span className="tile tile--lg">
              <TopIcon size={23} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h1>{top.category}</h1>
              <p className="quizResult__pick">
                Our pick: <strong>{top.name}</strong> — {top.evaluator}
              </p>
            </div>
          </div>

          <p className="quizResult__headline">{top.headline}</p>

          <div className="hero__actions">
            <Link to={`/cause/${top.id}`} className="btn btn--primary btn--lg">
              See the evidence
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
            <button type="button" className="btn btn--outline btn--lg" onClick={restart}>
              <RotateCcw size={17} aria-hidden="true" />
              Start over
            </button>
          </div>

          <div className="note note--plain" style={{ marginTop: 32 }}>
            <span>
              <strong>This is a conversation starter, not an algorithm.</strong> Four
              questions can't weigh a hen against a child, and we haven't tried to.
              All it does is notice which cause your answers leaned toward
              {runnerUp ? (
                <>
                  {" "}
                  — the runner-up was <Link to={`/cause/${runnerUp.id}`}>
                    {runnerUp.category}
                  </Link>, and it's worth a look too
                </>
              ) : null}
              . Every cause on this site is defensible; the quiz just picks a door.
            </span>
          </div>

          <p style={{ marginTop: 22 }}>
            <Link to="/#causes" className="crumb">
              <ArrowLeft size={16} aria-hidden="true" />
              Or browse all causes yourself
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const q = QUESTIONS[step];

  return (
    <section className="pageHead">
      <div className="wrap wrap--narrow">
        <p className="eyebrow">
          Question {step + 1} of {QUESTIONS.length}
        </p>

        <div
          className="quizBar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={step}
          aria-label="Quiz progress"
        >
          <span style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
        </div>

        <h1 style={{ marginTop: 26 }}>{q.question}</h1>

        {/* Keyed by step so the options deal themselves out on every question,
            not just the first. */}
        <div className="quizOptions" key={step}>
          {q.options.map((opt, i) => (
            <button
              type="button"
              key={opt.label}
              className="quizOption"
              onClick={() => choose(i)}
            >
              <span>{opt.label}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>

        {step > 0 && (
          <button
            type="button"
            className="crumb"
            style={{ marginTop: 26, background: "none", border: 0, padding: 0 }}
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
        )}
      </div>
    </section>
  );
}
