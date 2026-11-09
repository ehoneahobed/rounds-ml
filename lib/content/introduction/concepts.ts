import type { Concept } from "@/lib/content/types";

/**
 * Introduction concepts: a map of the territory, not a dump of every algorithm.
 * Examples deliberately span domains so learners generalize beyond any one field.
 */
export const concepts: Concept[] = [
  {
    slug: "what-ml-is",
    number: "01",
    title: "What machine learning is",
    minutes: 18,
    summary: "Learning a useful mapping from examples instead of writing every rule by hand.",
    blocks: [
      {
        type: "p",
        text: "People invent rules by hand all the time. A lender might say “if income is high and debt is low, approve.” A shop might say “if they abandoned the cart twice, send a coupon.” A coach might say “if sprint time is under X, start them.” That works until the combination space gets large, the world shifts, or two experts disagree on the cutoffs.",
      },
      {
        type: "p",
        text: "Machine learning is a different habit. You collect past cases where you already know what happened. You choose which facts are legal inputs at decision time (features) and which later outcome is the answer (the label). You then search for a model—a function from features to a prediction—that does well on those past rows, and you check whether it still does well on cases it has not seen.",
      },
      {
        type: "p",
        text: "The same habit shows up in many places: predicting house price from size and neighborhood, flagging a fraudulent payment, recommending a next song, estimating how long a delivery will take, or scoring clinical risk from early vitals. The domains change. The questions do not.",
      },
      {
        type: "p",
        text: "Training means adjusting the model using the past rows. Inference (or prediction) means applying the trained model to a new row. The trained thing is whatever the algorithm settled on: weights, a tree of questions, a set of clusters—depending on the family.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Not magic",
        text: "ML does not invent truth. It finds patterns that were in the training data. If the data leak the answer, or only came from one city, season, or hospital, the model will look clever and then fail. Later modules make that concrete.",
      },
      {
        type: "h2",
        text: "Three questions every project asks",
      },
      {
        type: "ol",
        items: [
          "What am I predicting, and when must I decide? (approve now vs after the loan defaults; ship today vs after the package arrives)",
          "What am I allowed to know at that moment? (features vs leakage—no peeking at the future)",
          "How will I know it worked on new cases? (a held-out test, not a score on the same rows you trained on)",
        ],
      },
      {
        type: "p",
        text: "Hold those three. The rest of this module is a map of how models learn. The next modules pick one supervised family at a time and make you build it—sometimes on a clinical project dataset, but the math is the same wherever the rows came from.",
      },
    ],
  },
  {
    slug: "supervised",
    number: "02",
    title: "Supervised learning",
    minutes: 28,
    summary: "Labeled examples: regression for numbers, classification for categories, and the families Rounds will build.",
    blocks: [
      {
        type: "p",
        text: "In supervised learning every training row already has the answer written down. You show the model the features and the label together. The hope is that a new case with similar features will get a similar answer.",
      },
      {
        type: "h2",
        text: "Regression vs classification",
      },
      {
        type: "p",
        text: "If the label is a number—price, minutes of delay, exam score, days until something happens—you are doing regression. The model’s job is to land close to that number. If the label is a category—spam or not, default or not, churn or not, deteriorate or not—you are doing classification. The model’s job is to name the class, often with a probability attached.",
      },
      {
        type: "table",
        caption: "Same idea, different domains.",
        headers: ["Domain", "Question", "Label type", "Example label"],
        rows: [
          ["Housing", "What will this listing sell for?", "Number (regression)", "$412,000"],
          ["Payments", "Is this charge fraudulent?", "Category (classification)", "0 or 1"],
          ["Education", "What score will this student get?", "Number (regression)", "78 points"],
          ["Support desk", "Will this ticket escalate?", "Category (classification)", "yes / no"],
        ],
      },
      {
        type: "p",
        text: "Rounds’ later projects happen to use hospital-style rows (length of stay as a number; deterioration as yes/no). That is one application, not the definition of the course. If you can name the label type, you can transfer the skill.",
      },
      {
        type: "h2",
        text: "Families under supervised learning",
      },
      {
        type: "p",
        text: "You do not need every algorithm yet. You need the shape of the map so later pages are not surprises.",
      },
      {
        type: "ul",
        items: [
          "Linear models: a weighted sum of features (plus a bias). Linear regression predicts a number. Logistic regression pushes that same kind of score through a sigmoid to get a probability for a class.",
          "Tree models: a flowchart of yes/no questions about features. Decision trees grow one flowchart. Random forests and gradient-boosted trees combine many trees. Rounds builds a single tree, then a forest, after you have felt linear and logistic.",
          "Nearest neighbors: remember the training rows; predict from the closest ones. Simple idea, can be slow and sensitive to scale.",
          "Support vector machines: find a boundary with a margin. Important historically; less central to this path.",
          "Neural networks: stacked linear scores and nonlinearities. They are still supervised when you train them with labels—they are a flexible function family, not a fourth learning paradigm.",
        ],
      },
      {
        type: "reveal",
        title: "Pause",
        prompt: "Predicting next month’s electricity bill in dollars: regression or classification? Predicting whether an email is phishing (yes/no): regression or classification?",
        answer: "Bill in dollars → regression (a number). Phishing yes/no → classification (a category).",
      },
      {
        type: "callout",
        tone: "practice",
        title: "Why Rounds orders the modules this way",
        text: "Linear regression teaches scores, error, and fitting. Logistic regression reuses the score, adds probability and classification metrics. Decision trees then offer a different shape—questions instead of weights—so the comparison is fair. Jumping straight to trees skips the shared language of scores and loss.",
      },
    ],
  },
  {
    slug: "unsupervised-rl",
    number: "03",
    title: "Unsupervised and reinforcement learning",
    minutes: 22,
    summary: "Learning without labels, and learning from rewards—enough to place them, not enough to ship them yet.",
    blocks: [
      {
        type: "h2",
        text: "Unsupervised learning",
      },
      {
        type: "p",
        text: "Sometimes you have rows with no label. You still want structure: groups of similar customers, a shorter list of factors that explain sensor readings, or weird transactions that do not match the rest. That is unsupervised learning—no answer column, just patterns in the features.",
      },
      {
        type: "ul",
        items: [
          "Clustering (for example k-means, hierarchical clustering): put similar rows in the same group. A retailer might find shopping “personas”; a city might find traffic patterns—without deciding an action yet.",
          "Dimensionality reduction (for example PCA): summarize many correlated measurements into fewer axes so humans can look or so another model can run lighter.",
          "Anomaly detection: flag rows that look unlike the rest—possible data errors, fraud candidates, or rare machine failures worth a second look.",
        ],
      },
      {
        type: "p",
        text: "Unsupervised methods are easy to over-interpret: a cluster is a pattern, not automatically a policy. Rounds does not build one yet. You only need to recognize when a problem has no label.",
      },
      {
        type: "h2",
        text: "Reinforcement learning",
      },
      {
        type: "p",
        text: "Reinforcement learning (RL) is for sequential decisions. An agent takes actions in an environment, gets rewards, and tries to improve its policy over time. Think a game-playing agent, a warehouse robot choosing routes, an ad system choosing what to show next, or a thermostat that adapts—not a single one-shot prediction.",
      },
      {
        type: "p",
        text: "RL needs a careful reward definition and usually a simulator or logged policy data. Getting the reward wrong teaches the agent the wrong habit. This map stops at: RL is not “supervised learning with a fancy name.” It is trial-and-error over time under a reward signal.",
      },
      {
        type: "reveal",
        title: "Pause",
        prompt: "You have 50,000 product pages with text and images, no sales labels, and you want groups of similar products. Supervised, unsupervised, or reinforcement?",
        answer: "Unsupervised—clustering (or a related structure method). There is no label to predict and no reward for an action sequence.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Semi-supervised and self-supervised",
        text: "You will also hear semi-supervised (few labels, many unlabeled rows) and self-supervised (invent a pretext task, common in language and vision). They sit between the map regions above. You do not need them to finish Rounds’ first supervised path.",
      },
    ],
  },
  {
    slug: "the-map",
    number: "04",
    title: "Neural nets, language, and this path",
    minutes: 20,
    summary: "Where deep learning and NLP sit, and what you will build next in Rounds.",
    blocks: [
      {
        type: "h2",
        text: "Neural networks",
      },
      {
        type: "p",
        text: "A neural network is a stack of linear scores and nonlinearities. With labels and a loss, training is still supervised learning—gradient descent on a bigger function. Without labels, the same stacks show up in unsupervised or self-supervised recipes. So “deep learning” is not a fourth paradigm beside supervised / unsupervised / RL; it is a flexible model class used inside those paradigms.",
      },
      {
        type: "p",
        text: "Why wait? Because logistic regression is already one linear score plus a sigmoid. A small neural net is several of those composed. If the single score is muddy, the stack will be muddier. Rounds builds the single score first.",
      },
      {
        type: "h2",
        text: "Natural language processing",
      },
      {
        type: "p",
        text: "NLP is an application area: models that work with text (and often speech). Reviews, tickets, chat, contracts, clinical notes—same idea. Under the hood you still choose a paradigm—classify a message (supervised), embed documents into a space (often self-supervised pretraining, then supervised fine-tuning), or train a dialogue policy (sometimes RL). NLP is not a separate kind of learning; it is ML applied to language.",
      },
      {
        type: "h2",
        text: "What you will do in Rounds next",
      },
      {
        type: "ol",
        items: [
          "Linear regression — predict a number with a line; learn error, fitting, and honest train/test habits. The project uses a continuous clinical outcome, but the line is the same tool you would use for price or delay.",
          "Logistic regression — reuse the linear score; turn it into a probability; learn thresholds and classification metrics. The project is a binary risk score.",
          "Decision trees — answer a classification question with a flowchart of questions, so you can compare shapes against the logistic score.",
          "Random forests — bag many trees with random feature subsets and vote, so one brittle tree is not the whole model.",
        ],
      },
      {
        type: "p",
        text: "Each of those modules has concept pages, a knowledge check, auto-graded tasks in the browser, and a short handoff note. This introduction has concepts and a check only—it is the map, not the hike.",
      },
      {
        type: "callout",
        tone: "practice",
        title: "Before you open linear regression",
        text: "Be able to say, in one sentence each: what supervised learning needs that unsupervised does not; one regression example and one classification example from any domain you care about; where neural nets sit on that map.",
      },
    ],
  },
];

export function conceptBySlug(slug: string): Concept | undefined {
  return concepts.find((concept) => concept.slug === slug);
}

export function conceptNeighbors(slug: string): { previous?: Concept; next?: Concept } {
  const index = concepts.findIndex((concept) => concept.slug === slug);
  if (index < 0) return {};
  return {
    previous: index > 0 ? concepts[index - 1] : undefined,
    next: index < concepts.length - 1 ? concepts[index + 1] : undefined,
  };
}
