"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Video,
  Mic,
  Square,
  Circle,
  Download,
  RefreshCw,
  Trash2,
  Play,
  Library,
} from "lucide-react";
import {
  saveRecording,
  listRecordings,
  getRecording,
  deleteRecording,
} from "@/lib/practice-db";

type Mode = "video" | "audio";
type Tab = "record" | "library";

type Meta = {
  id: string;
  title: string;
  mode: "video" | "audio";
  createdAt: number;
  durationSec: number;
  mimeType: string;
};

function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PracticeRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const [tab, setTab] = useState<Tab>("record");
  const [mode, setMode] = useState<Mode>("video");
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<Meta[]>([]);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [playingMode, setPlayingMode] = useState<"video" | "audio">("video");
  const [saving, setSaving] = useState(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const refreshLibrary = useCallback(async () => {
    try {
      setLibrary(await listRecordings());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function startPreview(nextMode: Mode) {
    clearTimer();
    setRecording(false);
    elapsedRef.current = 0;
    setElapsed(0);
    setBlob(null);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setError(null);
    setMode(nextMode);
    stopTracks();

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        nextMode === "video" ? { video: true, audio: true } : { audio: true }
      );
      streamRef.current = stream;
      if (videoRef.current && nextMode === "video") {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
    } catch {
      setError(
        "Could not access camera/microphone. Allow permission in the browser, then try again."
      );
      setReady(false);
    }
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setBlob(null);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);

    const mime =
      mode === "video"
        ? MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : "video/webm"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType: mime });
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const b = new Blob(chunksRef.current, { type: mime });
        setBlob(b);
        setBlobUrl(URL.createObjectURL(b));
      };
      recorder.start(200);

      // Reliable timer using ref + state
      clearTimer();
      elapsedRef.current = 0;
      setElapsed(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }, 1000);
    } catch {
      setError("Recording not supported. Try Chrome or Edge.");
    }
  }

  function stopRecording() {
    clearTimer();
    setRecording(false);
    // keep elapsed value for save duration
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  async function handleSave() {
    if (!blob) return;
    setSaving(true);
    try {
      await saveRecording({
        title: title.trim() || `Practice ${new Date().toLocaleString("en-IN")}`,
        mode,
        durationSec: elapsedRef.current || elapsed,
        blob,
        mimeType: blob.type,
      });
      setTitle("");
      await refreshLibrary();
      setTab("library");
    } catch (e) {
      console.error(e);
      setError("Could not save recording in this browser.");
    }
    setSaving(false);
  }

  async function handlePlay(id: string) {
    if (playingUrl) URL.revokeObjectURL(playingUrl);
    const rec = await getRecording(id);
    if (!rec) return;
    setPlayingMode(rec.mode);
    setPlayingUrl(URL.createObjectURL(rec.blob));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this recording?")) return;
    await deleteRecording(id);
    if (playingUrl) {
      URL.revokeObjectURL(playingUrl);
      setPlayingUrl(null);
    }
    await refreshLibrary();
  }

  useEffect(() => {
    return () => {
      clearTimer();
      stopTracks();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (playingUrl) URL.revokeObjectURL(playingUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setTab("record")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            tab === "record"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Record
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("library");
            refreshLibrary();
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg inline-flex items-center gap-2 ${
            tab === "library"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Library className="h-4 w-4" />
          Find your recordings ({library.length})
        </button>
      </div>

      {tab === "record" && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">Mock interview practice</CardTitle>
            <p className="text-sm text-slate-500">
              Record on this device. Save to library to keep, play, or delete later.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={mode === "video" ? "default" : "outline"}
                size="sm"
                disabled={recording}
                onClick={() => startPreview("video")}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                Camera + mic
              </Button>
              <Button
                type="button"
                variant={mode === "audio" ? "default" : "outline"}
                size="sm"
                disabled={recording}
                onClick={() => startPreview("audio")}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                Voice only
              </Button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Always-visible timer when recording */}
            {recording && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 py-3">
                <Circle className="h-3 w-3 fill-red-600 text-red-600 animate-pulse" />
                <span className="font-mono text-2xl font-bold text-red-600 tabular-nums">
                  {formatTime(elapsed)}
                </span>
                <span className="text-sm text-red-600/80">recording</span>
              </div>
            )}

            {mode === "video" && (
              <div className="relative w-full aspect-video max-h-[55vh] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm px-4 text-center">
                    Click “Camera + mic” to enable preview
                  </div>
                )}
              </div>
            )}

            {mode === "audio" && ready && !recording && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 py-10 gap-2">
                <Mic className="h-10 w-10 text-slate-400" />
                <p className="text-sm text-slate-500">Microphone ready — press Start recording</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {ready && !recording && (
                <Button type="button" onClick={startRecording} className="gap-2">
                  <Circle className="h-4 w-4 fill-current" />
                  Start recording
                </Button>
              )}
              {recording && (
                <Button type="button" variant="destructive" onClick={stopRecording} className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop ({formatTime(elapsed)})
                </Button>
              )}
              {ready && !recording && (
                <Button type="button" variant="outline" onClick={() => startPreview(mode)} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>

            {blobUrl && blob && (
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-sm font-medium">
                  Preview · duration {formatTime(elapsedRef.current || elapsed)}
                </p>
                {mode === "video" ? (
                  <video src={blobUrl} controls className="w-full max-h-[45vh] rounded-lg" />
                ) : (
                  <audio src={blobUrl} controls className="w-full" />
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Title (e.g. Tell me about yourself)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Button type="button" onClick={handleSave} disabled={saving} className="shrink-0">
                    {saving ? "Saving…" : "Save to library"}
                  </Button>
                  <a
                    href={blobUrl}
                    download={`practice-${Date.now()}.webm`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "library" && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">Find your recordings</CardTitle>
            <p className="text-sm text-slate-500">
              Stored in this browser. Play or delete anytime.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {library.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No saved recordings yet. Record and click <strong>Save to library</strong>.
              </p>
            ) : (
              <ul className="space-y-3">
                {library.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{r.title}</p>
                      <p className="text-xs text-slate-500">
                        {r.mode} · {formatTime(r.durationSec)} ·{" "}
                        {new Date(r.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button type="button" size="sm" variant="outline" onClick={() => handlePlay(r.id)} className="gap-1">
                        <Play className="h-3.5 w-3.5" />
                        Play
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(r.id)}
                        className="gap-1 text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {playingUrl && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                <p className="text-sm font-medium">Now playing</p>
                {playingMode === "video" ? (
                  <video src={playingUrl} controls className="w-full max-h-[45vh] rounded-lg" />
                ) : (
                  <audio src={playingUrl} controls className="w-full" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
