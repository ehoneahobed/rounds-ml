import figures from "@/data/figures.json";

/** Lactate cut on the teaching tree. Values at or below go left. */
export const LACTATE_CUT = 1.8;

/** Age cut, asked only after lactate is above {@link LACTATE_CUT}. */
export const AGE_CUT = 64.5;

export const LACTATE_MIN = 0;
export const LACTATE_MAX = 4;
export const AGE_MIN = 30;
export const AGE_MAX = 100;

export type Admission = {
  lactate: number;
  age: number;
  /** 1 if the patient deteriorated, 0 otherwise. */
  y: 0 | 1;
};

/** One answer the tree gives while walking a row from the root. */
export type WalkStep = {
  question: string;
  taken: "left" | "right";
  detail: string;
};

export type Walk = {
  steps: WalkStep[];
  prediction: 0 | 1;
  /** The leaf sentence, same contract as export_paths. */
  rule: string;
};

export type MissionId = "patients" | "lactate" | "age" | "walk";

/** How much of the teaching tree the lab is currently drawing. */
export type Stage = "none" | "first" | "both";

export type Mission = {
  id: MissionId;
  title: string;
  body: string;
  stage: Stage;
};

/** The eight admissions drawn on the concept pages. */
export function teachingAdmissions(): Admission[] {
  return figures.trace.rows.map((row) => ({
    lactate: row.lactate,
    age: row.age,
    y: row.y === 1 ? 1 : 0,
  }));
}

/**
 * Walk one patient down the teaching tree.
 * The root question is always lactate. Age is asked only on the right.
 */
export function walkPatient(lactate: number, age: number): Walk {
  if (lactate <= LACTATE_CUT) {
    return {
      steps: [
        {
          question: `lactate <= ${LACTATE_CUT.toFixed(2)}`,
          taken: "left",
          detail: "Yes. This side is all label 0, so the tree stops.",
        },
      ],
      prediction: 0,
      rule: "if lactate <= 1.80 then 0 (p=1.00, n=4)",
    };
  }
  const first: WalkStep = {
    question: `lactate <= ${LACTATE_CUT.toFixed(2)}`,
    taken: "right",
    detail: "No. Lactate is above 1.80, so the tree asks about age.",
  };
  if (age <= AGE_CUT) {
    return {
      steps: [
        first,
        {
          question: `age <= ${AGE_CUT.toFixed(2)}`,
          taken: "left",
          detail: "Yes. Both training patients on this side have label 0.",
        },
      ],
      prediction: 0,
      rule: "if lactate > 1.80 AND age <= 64.50 then 0 (p=1.00, n=2)",
    };
  }
  return {
    steps: [
      first,
      {
        question: `age <= ${AGE_CUT.toFixed(2)}`,
        taken: "right",
        detail: "No. Both training patients on this side deteriorated.",
      },
    ],
    prediction: 1,
    rule: "if lactate > 1.80 AND age > 64.50 then 1 (p=1.00, n=2)",
  };
}

/** The four benches of the lab, in the order a learner should open them. */
export const missions: Mission[] = [
  {
    id: "patients",
    title: "Everyone in one node",
    body: "Each sphere is one admission. Green did not deteriorate. Rust did. Six are green and two are rust, so the node is mixed. A tree asks a question when a node is mixed.",
    stage: "none",
  },
  {
    id: "lactate",
    title: "The first question",
    body: "The root asks whether lactate is at or below 1.80. Yes goes left and stops: four patients, all label 0, so that leaf predicts 0. No goes right. That node is still two and two.",
    stage: "first",
  },
  {
    id: "age",
    title: "The second question",
    body: "Age is asked only on the right. The question is whether age is at or below 64.50. The younger leaf predicts 0. The older leaf predicts 1. Three leaves, and every patient sits on exactly one of them.",
    stage: "both",
  },
  {
    id: "walk",
    title: "Walk a new patient",
    body: "The gold sphere is a new patient. Move it with the sliders, or click a training patient. The gold branches are the questions that person is actually asked. A low lactate stops at the left leaf.",
    stage: "both",
  },
];
