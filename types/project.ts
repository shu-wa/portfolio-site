export type DesignDecision = {
  title: string;
  what: string;
  why: string;
  effect: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  overview: string;
  tech: string[];
  features: string[];
  designDecisions: DesignDecision[];
  problems: string[];
  learnings: string[];
  future: string[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};