"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";

type UploadedFile = {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
};

export function FileUpload({
  sessionId,
  onUploaded,
}: {
  sessionId?: string;
  onUploaded?: (file: UploadedFile) => void;
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    setUploading(true);

    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);
      if (sessionId) formData.append("sessionId", sessionId);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Upload failed");
          continue;
        }
        const uploaded: UploadedFile = {
          id: data.id,
          url: data.url,
          fileName: data.fileName,
          fileType: data.fileType,
        };
        setFiles((prev) => [...prev, uploaded]);
        onUploaded?.(uploaded);
      } catch {
        setError("Upload failed. Is the server running?");
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeLocal(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition"
      >
        <Upload className="h-6 w-6 text-slate-400" />
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          {uploading ? "Uploading…" : "Drop screenshot or PDF here, or click to browse"}
        </p>
        <p className="text-xs text-slate-400">PNG, JPG, WEBP, GIF, PDF · max 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
            >
              {f.fileType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt={f.fileName} className="h-10 w-10 object-cover rounded" />
              ) : (
                <FileText className="h-5 w-5 text-slate-400 shrink-0" />
              )}
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-blue-600 hover:underline dark:text-blue-400"
              >
                {f.fileName}
              </a>
              <button
                type="button"
                onClick={() => removeLocal(f.id)}
                className="p-1 text-slate-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
