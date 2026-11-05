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

export type Mission = {
  id: MissionId;
  title: string;
  body: string;
  lactateWall: boolean;
  ageWall: boolean;
  regions: "none" | "first" | "both";
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
    title: "Eight patients on the table",
    body: "Each sphere is one admission. Green did not deteriorate. Rust did. Drag the table to turn it. The axes are lactate and age, the two columns this tree asks about.",
    lactateWall: false,
    ageWall: false,
    regions: "none",
  },
  {
    id: "lactate",
    title: "The first question",
    body: "The pale wall is lactate = 1.80. Patients on the low side all have label 0, so that side becomes a leaf. The high side is still mixed: two deteriorated, two did not. The tree has to ask another question there.",
    lactateWall: true,
    ageWall: false,
    regions: "first",
  },
  {
    id: "age",
    title: "The second question",
    body: "Age is asked only on the high-lactate side. The second wall is age = 64.50. The younger box predicts 0. The older box predicts 1. Three boxes, three leaves, and every patient is in exactly one of them.",
    lactateWall: true,
    ageWall: true,
    regions: "both",
  },
  {
    id: "walk",
    title: "Walk a new patient",
    body: "The gold sphere is not in the training table. Move it with the sliders, or click a training patient to stand on that row. The root question is always first. A low lactate never reaches the age wall.",
    lactateWall: true,
    ageWall: true,
    regions: "both",
  },
];
