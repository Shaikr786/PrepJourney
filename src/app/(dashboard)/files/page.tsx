import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image as ImageIcon, Paperclip } from "lucide-react";

export default async function FilesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const files = await prisma.attachment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      session: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="space-y-6 w-full">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
          <Paperclip className="h-6 w-6" />
          Your files
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Screenshots and PDFs uploaded with sessions · {files.length} file
          {files.length !== 1 ? "s" : ""}
        </p>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500 text-sm">
            No files yet. When you add a session, use <strong>Attachments</strong> to
            upload a screenshot or PDF — they will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((f) => {
            const isImage = f.fileType.startsWith("image/");
            return (
              <Card key={f.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {isImage ? (
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={f.fileName}
                        className="h-40 w-full object-cover bg-slate-100 dark:bg-slate-800"
                      />
                    </a>
                  ) : (
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-40 w-full items-center justify-center bg-slate-100 dark:bg-slate-800"
                    >
                      <FileText className="h-12 w-12 text-slate-400" />
                    </a>
                  )}
                  <div className="p-3 space-y-1">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 line-clamp-2"
                    >
                      {f.fileName}
                    </a>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(f.createdAt)} ·{" "}
                      {(f.fileSize / 1024).toFixed(0)} KB
                    </p>
                    {f.session ? (
                      <Link
                        href={`/sessions/${f.session.id}/edit`}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:underline"
                      >
                        Session: {f.session.title}
                      </Link>
                    ) : (
                      <p className="text-xs text-slate-400">Not linked to a session</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
