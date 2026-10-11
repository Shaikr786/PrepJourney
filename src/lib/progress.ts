/**
 * Auto progress % by category — derived from sessions only (no manual levels).
 *
 * percent = 50% time-toward-target + 50% confidence depth
 * remaining = hints for what’s left to push the bar up
 */

export type Confidence = "LEARNING" | "PRACTICED" | "REVISION" | "INTERVIEW_READY";

const CONFIDENCE_PCT: Record<string, number> = {
  LEARNING: 25,
  PRACTICED: 50,
  REVISION: 75,
  INTERVIEW_READY: 100,
};

/** Default target minutes per category (10 hours) — soft goal for 100% time part */
export const DEFAULT_TARGET_MINUTES = 600;

export type TrackId = "interview" | "exam" | "career";

export type TrackSubject = {
  category: string;
  label: string;
  targetMinutes?: number;
};

export type PrepTrack = {
  id: TrackId;
  name: string;
  description: string;
  subjects: TrackSubject[];
};

/** Predefined paths — progress is still driven by real sessions */
export const PREP_TRACKS: PrepTrack[] = [
  {
    id: "interview",
    name: "Interview preparation",
    description: "Tech + behavioral readiness for job interviews",
    subjects: [
      { category: "JAVA", label: "Java" },
      { category: "DSA", label: "DSA" },
      { category: "DBMS", label: "DBMS / SQL" },
      { category: "OS", label: "Operating systems" },
      { category: "SYSTEM_DESIGN", label: "System design" },
      { category: "NETWORKING", label: "Networking" },
      { category: "BEHAVIORAL", label: "Behavioral" },
      { category: "PROJECT", label: "Projects" },
    ],
  },
  {
    id: "exam",
    name: "Competitive exams (e.g. GATE)",
    description: "Subject-wise coverage for exam-style prep",
    subjects: [
      { category: "JAVA", label: "Programming / Java" },
      { category: "DSA", label: "Algorithms & DS" },
      { category: "DBMS", label: "Database systems" },
      { category: "OS", label: "Operating systems" },
      { category: "NETWORKING", label: "Computer networks" },
      { category: "SYSTEM_DESIGN", label: "Compiler / design topics" },
      { category: "EXAM", label: "Exam practice / mocks" },
      { category: "OTHER", label: "Other theory" },
    ],
  },
  {
    id: "career",
    name: "Career switch / growth",
    description: "Skills beyond pure coding interviews",
    subjects: [
      { category: "CAREER", label: "Career prep" },
      { category: "SOFT_SKILLS", label: "Soft skills" },
      { category: "PROJECT", label: "Portfolio projects" },
      { category: "BEHAVIORAL", label: "Communication" },
      { category: "OTHER", label: "General learning" },
    ],
  },
];

export type CategoryAgg = {
  category: string;
  totalMinutes: number;
  sessionCount: number;
  /** best confidence seen */
  bestConfidence: string | null;
  /** average confidence score 25–100 */
  avgConfidencePct: number;
};

export type SubjectProgress = {
  category: string;
  label: string;
  totalMinutes: number;
  sessionCount: number;
  bestConfidence: string | null;
  percent: number;
  timePercent: number;
  confidencePercent: number;
  targetMinutes: number;
  remainingMinutes: number;
  remainingHints: string[];
};

export function confidenceLabel(c: string | null): string {
  if (!c) return "Not started";
  const map: Record<string, string> = {
    LEARNING: "Learning",
    PRACTICED: "Practiced",
    REVISION: "Revision",
    INTERVIEW_READY: "Interview-ready",
  };
  return map[c] || c;
}

export function computeSubjectProgress(
  subject: TrackSubject,
  agg: CategoryAgg | undefined
): SubjectProgress {
  const target = subject.targetMinutes ?? DEFAULT_TARGET_MINUTES;
  const totalMinutes = agg?.totalMinutes ?? 0;
  const sessionCount = agg?.sessionCount ?? 0;
  const bestConfidence = agg?.bestConfidence ?? null;
  const avgConfidencePct = agg?.avgConfidencePct ?? 0;

  const timePercent = Math.min(100, Math.round((totalMinutes / target) * 100));
  const confidencePercent =
    sessionCount === 0 ? 0 : Math.round(avgConfidencePct);

  const percent = Math.round(0.5 * timePercent + 0.5 * confidencePercent);

  const remainingMinutes = Math.max(0, target - totalMinutes);
  const remainingHints: string[] = [];

  if (sessionCount === 0) {
    remainingHints.push("Log your first session in this subject");
  } else {
    if (timePercent < 100) {
      remainingHints.push(
        `~${remainingMinutes} more minutes toward the ${Math.round(target / 60)}h goal`
      );
    }
    if (confidencePercent < 100) {
      const next =
        bestConfidence === "LEARNING"
          ? "Practice with examples (raise to Practiced)"
          : bestConfidence === "PRACTICED"
            ? "Revise without notes"
            : bestConfidence === "REVISION"
              ? "Aim for Interview-ready explanations"
              : "Keep reinforcing at Interview-ready";
      remainingHints.push(next);
    }
    if (timePercent >= 100 && confidencePercent >= 100) {
      remainingHints.push("Subject goal met — maintain with light revision");
    }
  }

  return {
    category: subject.category,
    label: subject.label,
    totalMinutes,
    sessionCount,
    bestConfidence,
    percent,
    timePercent,
    confidencePercent,
    targetMinutes: target,
    remainingMinutes,
    remainingHints,
  };
}

export function trackOverallPercent(subjects: SubjectProgress[]): number {
  if (subjects.length === 0) return 0;
  const sum = subjects.reduce((s, x) => s + x.percent, 0);
  return Math.round(sum / subjects.length);
}

const CONF_RANK: Record<string, number> = {
  LEARNING: 1,
  PRACTICED: 2,
  REVISION: 3,
  INTERVIEW_READY: 4,
};

export function aggregateByCategory(
  sessions: {
    category: string;
    durationMinutes: number;
    confidence: string;
  }[]
): Map<string, CategoryAgg> {
  const map = new Map<
    string,
    {
      totalMinutes: number;
      sessionCount: number;
      confSum: number;
      best: string | null;
      bestRank: number;
    }
  >();

  for (const s of sessions) {
    const cur = map.get(s.category) || {
      totalMinutes: 0,
      sessionCount: 0,
      confSum: 0,
      best: null as string | null,
      bestRank: 0,
    };
    cur.totalMinutes += s.durationMinutes;
    cur.sessionCount += 1;
    cur.confSum += CONFIDENCE_PCT[s.confidence] ?? 25;
    const rank = CONF_RANK[s.confidence] ?? 0;
    if (rank > cur.bestRank) {
      cur.bestRank = rank;
      cur.best = s.confidence;
    }
    map.set(s.category, cur);
  }

  const out = new Map<string, CategoryAgg>();
  for (const [cat, v] of map) {
    out.set(cat, {
      category: cat,
      totalMinutes: v.totalMinutes,
      sessionCount: v.sessionCount,
      bestConfidence: v.best,
      avgConfidencePct: v.sessionCount ? v.confSum / v.sessionCount : 0,
    });
  }
  return out;
}
