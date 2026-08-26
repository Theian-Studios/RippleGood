/**
 * A short values questionnaire that ends at a cause page.
 *
 * It is a conversation starter, not an algorithm, and the results screen says
 * so. Each option carries plain weights over cause ids; we sum them and show
 * the top result alongside the runner-up, because a quiz that hides its second
 * choice is pretending to a confidence it hasn't earned.
 */
export const QUESTIONS = [
  {
    id: "who",
    question: "Who do you find yourself thinking about?",
    options: [
      {
        label: "Children who could be protected cheaply",
        weights: { "global-health": 3, "child-nutrition": 3, "disease-prevention": 3, deworming: 2, "lead-exposure": 2 },
      },
      {
        label: "Families who just need money",
        weights: { "direct-cash": 4 },
      },
      {
        label: "Animals nobody sees",
        weights: { "animal-welfare": 5 },
      },
      {
        label: "Everyone who comes after us",
        weights: { climate: 4, "lead-exposure": 3 },
      },
    ],
  },
  {
    id: "certainty",
    question: "Which would you rather have?",
    options: [
      {
        label: "A smaller result I can be confident actually happened",
        weights: {
          "global-health": 3,
          "disease-prevention": 3,
          "child-nutrition": 2,
          "direct-cash": 3,
        },
      },
      {
        label: "A much larger result that might not come off at all",
        weights: { climate: 4, "lead-exposure": 4, deworming: 2 },
      },
    ],
  },
  {
    id: "shape",
    question: "What kind of help feels right to you?",
    options: [
      {
        label: "Something physical, delivered to a person",
        weights: {
          "global-health": 3,
          "child-nutrition": 3,
          "disease-prevention": 2,
          deworming: 2,
        },
      },
      {
        label: "Changing a rule, so the problem stops happening",
        weights: { "lead-exposure": 4, "animal-welfare": 3, climate: 3 },
      },
      {
        label: "Trusting people to decide for themselves",
        weights: { "direct-cash": 5 },
      },
    ],
  },
  {
    id: "risk",
    question: "How do you feel about being wrong?",
    options: [
      {
        label: "I'd rather back the best-established evidence",
        weights: {
          "global-health": 3,
          "disease-prevention": 3,
          "direct-cash": 2,
          "child-nutrition": 2,
        },
      },
      {
        label: "I'll take a contested bet if the payoff is big enough",
        weights: { deworming: 4, "lead-exposure": 3, climate: 2 },
      },
    ],
  },
];

/**
 * answers: array of option indexes, one per question (or null if skipped).
 * Returns cause ids ordered best-first, with their scores.
 */
export function scoreQuiz(answers) {
  const totals = {};

  QUESTIONS.forEach((q, i) => {
    const choice = q.options[answers[i]];
    if (!choice) return;
    Object.entries(choice.weights).forEach(([id, w]) => {
      totals[id] = (totals[id] || 0) + w;
    });
  });

  return Object.entries(totals)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
