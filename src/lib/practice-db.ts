/**
 * Client-side store for practice recordings (IndexedDB).
 * Videos stay on the user's device — never uploaded to the server.
 */

const DB_NAME = "interview-prep-practice";
const STORE = "recordings";
const VERSION = 1;

export type PracticeRecording = {
  id: string;
  title: string;
  mode: "video" | "audio";
  createdAt: number;
  durationSec: number;
  blob: Blob;
  mimeType: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

export async function saveRecording(
  data: Omit<PracticeRecording, "id" | "createdAt"> & { id?: string }
): Promise<PracticeRecording> {
  const db = await openDb();
  const record: PracticeRecording = {
    id: data.id || crypto.randomUUID(),
    title: data.title,
    mode: data.mode,
    createdAt: Date.now(),
    durationSec: data.durationSec,
    blob: data.blob,
    mimeType: data.mimeType,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

export async function listRecordings(): Promise<
  Omit<PracticeRecording, "blob">[]
> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const all = (req.result as PracticeRecording[])
        .map(({ id, title, mode, createdAt, durationSec, mimeType }) => ({
          id,
          title,
          mode,
          createdAt,
          durationSec,
          mimeType,
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
      resolve(all);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getRecording(id: string): Promise<PracticeRecording | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as PracticeRecording) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
