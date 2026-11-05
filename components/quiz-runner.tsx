"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PASS_MARK, questions, type ChoiceId } from "@/lib/content/quiz";
import { loadProgress, saveProgress, useStudyProgress } from "@/lib/progress";

/** Sixteen questions, scored locally. The best score is what the module keeps. */
export function QuizRunner() {
  const progress = useStudyProgress();
  const [answers, setAnswers] = useState<Record<string, ChoiceId | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const best = progress.quizBest;

  const answered = questions.filter((question) => answers[question.id]).length;
  const score = questions.filter((question) => answers[question.id] === question.correct).length;
  const passed = score >= PASS_MARK;

  function submit() {
    setSubmitted(true);
    const current = loadProgress();
    const quizBest = current.quizBest === null ? score : Math.max(current.quizBest, score);
    const next = { ...current, quizBest, quizPassed: current.quizPassed || score >= PASS_MARK };
    saveProgress(next);
  }

  function retake() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Knowledge check · {questions.length} questions · pass at {PASS_MARK}</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Before the tasks</h1>
      <p className="mt-3 text-lg leading-relaxed">
        These are the calculations and the judgments from the concept pages. A wrong answer is more useful here than in the editor. Best score so far: {best === null ? "not taken" : `${best}/${questions.length}`}.
      </p>
      <ol className="mt-8 space-y-8">
        {questions.map((question, index) => {
          const chosen = answers[question.id];
          return (
            <li key={question.id} className="border-t border-line pt-6">
              <fieldset disabled={submitted}>
                <legend className="text-base font-semibold leading-relaxed">
                  {index + 1}. {question.prompt}
                </legend>
                <div className="mt-3 space-y-2">
                  {question.choices.map((choice) => {
                    const selected = chosen === choice.id;
                    const show = submitted && (choice.id === question.correct || selected);
                    const tone =
                      submitted && choice.id === question.correct
                        ? "border-green bg-green-soft"
                        : submitted && selected
                          ? "border-rust bg-rust-soft"
                          : "border-line";
                    return (
                      <label key={choice.id} className={`flex cursor-pointer gap-3 border px-3 py-2 ${tone}`}>
                        <input
                          type="radio"
                          name={question.id}
                          className="mt-1"
                          checked={selected}
                          onChange={() => setAnswers((current) => ({ ...current, [question.id]: choice.id }))}
                        />
                        <span>
                          <span className="font-mono text-sm text-muted">{choice.id}. </span>
                          {choice.text}
                          {show && choice.id === question.correct ? <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-green">Correct</span> : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {submitted ? <p className="mt-3 text-sm leading-relaxed text-ink">{question.explanation}</p> : null}
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {submitted ? (
          <>
            <p className="font-serif text-2xl" role="status">
              {score}/{questions.length}. {passed ? "That clears the check." : `The bar is ${PASS_MARK}.`}
            </p>
            <Button type="button" variant="outline" onClick={retake}>
              Retake
            </Button>
          </>
        ) : (
          <>
            <Button type="button" onClick={submit} disabled={answered !== questions.length}>
              Score the check
            </Button>
            <p className="text-sm text-muted">
              {answered}/{questions.length} answered
            </p>
          </>
        )}
      </div>
    </div>
  );
}
