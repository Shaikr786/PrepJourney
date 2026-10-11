/**
 * Rule-based skill extraction from session category / topic / concepts.
 * No LLM required — deterministic and free.
 */

export type SkillHint = {
  name: string;
  type: "TECH" | "TOOL" | "SOFT" | "DOMAIN";
};

const CATEGORY_SKILLS: Record<string, SkillHint> = {
  JAVA: { name: "Java", type: "TECH" },
  DSA: { name: "Data Structures & Algorithms", type: "TECH" },
  DBMS: { name: "Database / SQL", type: "TECH" },
  OS: { name: "Operating Systems", type: "TECH" },
  SYSTEM_DESIGN: { name: "System Design", type: "TECH" },
  NETWORKING: { name: "Networking", type: "TECH" },
  BEHAVIORAL: { name: "Behavioral interviews", type: "SOFT" },
  CAREER: { name: "Career preparation", type: "DOMAIN" },
  EXAM: { name: "Exam preparation", type: "DOMAIN" },
  SOFT_SKILLS: { name: "Soft skills", type: "SOFT" },
  PROJECT: { name: "Project building", type: "DOMAIN" },
  OTHER: { name: "General learning", type: "DOMAIN" },
};

/** Keyword → skill (checked against topic + concepts + title, lowercased) */
const KEYWORD_SKILLS: { keys: string[]; skill: SkillHint }[] = [
  { keys: ["spring", "spring boot"], skill: { name: "Spring Boot", type: "TECH" } },
  { keys: ["hibernate", "jpa"], skill: { name: "JPA / Hibernate", type: "TECH" } },
  { keys: ["react", "next.js", "nextjs"], skill: { name: "React / Next.js", type: "TECH" } },
  { keys: ["node", "express"], skill: { name: "Node.js", type: "TECH" } },
  { keys: ["python"], skill: { name: "Python", type: "TECH" } },
  { keys: ["selenium", "cypress", "playwright", "testing", "qa", "testng", "junit"], skill: { name: "Testing / QA", type: "TOOL" } },
  { keys: ["git", "github"], skill: { name: "Git", type: "TOOL" } },
  { keys: ["docker", "kubernetes", "k8s"], skill: { name: "Docker / K8s", type: "TOOL" } },
  { keys: ["sql", "postgres", "mysql", "mongodb"], skill: { name: "Database / SQL", type: "TECH" } },
  { keys: ["oop", "oops", "constructor", "inheritance", "polymorphism"], skill: { name: "Java", type: "TECH" } },
  { keys: ["array", "linked list", "tree", "graph", "dp", "dynamic programming", "sorting"], skill: { name: "Data Structures & Algorithms", type: "TECH" } },
  { keys: ["communication", "presentation", "leadership"], skill: { name: "Communication", type: "SOFT" } },
  { keys: ["resume", "linkedin"], skill: { name: "Career preparation", type: "DOMAIN" } },
  { keys: ["typescript", "javascript", "js "], skill: { name: "JavaScript / TypeScript", type: "TECH" } },
  { keys: ["rest", "api", "microservices"], skill: { name: "APIs / Backend", type: "TECH" } },
];

const CONFIDENCE_LEVEL: Record<string, number> = {
  LEARNING: 1,
  PRACTICED: 2,
  REVISION: 3,
  INTERVIEW_READY: 4,
};

export function extractSkillsFromSession(input: {
  category: string;
  title?: string;
  topic?: string;
  conceptsCovered?: string[];
}): SkillHint[] {
  const found = new Map<string, SkillHint>();

  const cat = CATEGORY_SKILLS[input.category];
  if (cat) found.set(cat.name.toLowerCase(), cat);

  const text = [
    input.title || "",
    input.topic || "",
    ...(input.conceptsCovered || []),
  ]
    .join(" ")
    .toLowerCase();

  for (const row of KEYWORD_SKILLS) {
    if (row.keys.some((k) => text.includes(k))) {
      found.set(row.skill.name.toLowerCase(), row.skill);
    }
  }

  return Array.from(found.values());
}

/** Map session confidence + volume into a 1–5 skill level suggestion */
export function deriveLevel(
  confidence: string,
  sessionCount: number,
  totalMinutes: number
): number {
  const base = CONFIDENCE_LEVEL[confidence] ?? 1;
  let level = base;
  if (sessionCount >= 5 || totalMinutes >= 300) level = Math.max(level, 3);
  if (sessionCount >= 10 || totalMinutes >= 600) level = Math.max(level, 4);
  if (confidence === "INTERVIEW_READY" && sessionCount >= 3) level = 5;
  return Math.min(5, Math.max(1, level));
}
