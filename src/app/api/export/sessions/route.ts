import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.learningSession.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  const headers = [
    "Title",
    "Topic",
    "Category",
    "Date",
    "Duration (min)",
    "Concepts",
    "Key Takeaway",
    "Confidence",
    "Revision Needed",
    "Score Points",
    "Next Step",
  ];

  const rows = sessions.map((s) => [
    `"${(s.title || "").replace(/"/g, '""')}"`,
    `"${(s.topic || "").replace(/"/g, '""')}"`,
    s.category,
    s.date.toISOString().slice(0, 10),
    s.durationMinutes,
    `"${s.conceptsCovered.join("; ").replace(/"/g, '""')}"`,
    `"${(s.keyTakeaway || "").replace(/"/g, '""')}"`,
    s.confidence,
    s.revisionNeeded ? "Yes" : "No",
    s.scorePoints,
    `"${(s.nextStep || "").replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="learning-sessions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
