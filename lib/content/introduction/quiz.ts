import type { Question } from "@/lib/content/quiz";

export const PASS_MARK = 7;

export const questions: Question[] = [
  {
    id: "ml-def",
    prompt: "In this course, what does “training” a supervised model mean?",
    choices: [
      { id: "A", text: "Writing every rule by hand before looking at data" },
      { id: "B", text: "Adjusting the model using past rows that already have labels" },
      { id: "C", text: "Deploying the model in production without a test set" },
      { id: "D", text: "Deleting features that look unimportant" },
    ],
    correct: "B",
    explanation: "Training uses labeled past examples to settle the model (weights, tree, and so on).",
  },
  {
    id: "features-time",
    prompt: "You must approve a loan today. Which column is illegal as a feature?",
    choices: [
      { id: "A", text: "Applicant income known at application time" },
      { id: "B", text: "Credit score available when they apply" },
      { id: "C", text: "Whether they defaulted two years later" },
      { id: "D", text: "Employment status listed on the form" },
    ],
    correct: "C",
    explanation: "Future default is the outcome (or after the decision). Using it is leakage.",
  },
  {
    id: "reg-vs-clf",
    prompt: "Predicting next month’s electricity bill in dollars is best described as:",
    choices: [
      { id: "A", text: "Classification" },
      { id: "B", text: "Regression" },
      { id: "C", text: "Reinforcement learning" },
      { id: "D", text: "Clustering" },
    ],
    correct: "B",
    explanation: "The label is a number, so the supervised task is regression.",
  },
  {
    id: "clf-task",
    prompt: "Predicting whether an email is phishing (yes/no) is:",
    choices: [
      { id: "A", text: "Regression" },
      { id: "B", text: "Unsupervised clustering" },
      { id: "C", text: "Classification" },
      { id: "D", text: "Reinforcement learning" },
    ],
    correct: "C",
    explanation: "The label is a category (yes/no), so it is classification.",
  },
  {
    id: "unsupervised",
    prompt: "You have 50,000 product pages with text and images, no sales labels, and you want groups of similar products. Which paradigm fits?",
    choices: [
      { id: "A", text: "Supervised classification" },
      { id: "B", text: "Unsupervised learning (for example clustering)" },
      { id: "C", text: "Reinforcement learning" },
      { id: "D", text: "Always linear regression" },
    ],
    correct: "B",
    explanation: "No labels → unsupervised structure finding, such as clustering.",
  },
  {
    id: "rl",
    prompt: "Which problem is closest to reinforcement learning?",
    choices: [
      { id: "A", text: "Predict house price from square footage in one shot" },
      { id: "B", text: "Cluster support tickets into topics with no labels" },
      { id: "C", text: "A warehouse robot choosing routes over time to minimize delay reward" },
      { id: "D", text: "Fit a line with ordinary least squares" },
    ],
    correct: "C",
    explanation: "RL is sequential actions with a reward signal, not a single labeled prediction.",
  },
  {
    id: "nn-place",
    prompt: "Where do neural networks sit on the map taught here?",
    choices: [
      { id: "A", text: "A fourth paradigm beside supervised, unsupervised, and RL" },
      { id: "B", text: "A flexible model class used inside those paradigms" },
      { id: "C", text: "Only unsupervised learning" },
      { id: "D", text: "Only reinforcement learning" },
    ],
    correct: "B",
    explanation: "Deep stacks are model families; with labels they are still supervised learning.",
  },
  {
    id: "nlp",
    prompt: "Natural language processing in this map is best described as:",
    choices: [
      { id: "A", text: "Its own learning paradigm, separate from supervised learning" },
      { id: "B", text: "An application area that still uses supervised, self-supervised, or other recipes on text" },
      { id: "C", text: "Always unsupervised clustering of words" },
      { id: "D", text: "Identical to linear regression" },
    ],
    correct: "B",
    explanation: "NLP is ML applied to language; the paradigm depends on the task and labels.",
  },
  {
    id: "order",
    prompt: "Why does Rounds teach linear regression before logistic regression?",
    choices: [
      { id: "A", text: "Because classification is never used outside hospitals" },
      { id: "B", text: "Because logistic regression reuses the linear score and then adds probability" },
      { id: "C", text: "Because trees cannot classify" },
      { id: "D", text: "Because unsupervised learning requires a line first" },
    ],
    correct: "B",
    explanation: "Logistic regression builds on the same weighted score, then maps it to a probability.",
  },
];
