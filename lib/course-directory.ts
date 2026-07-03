type DirectoryPickerWindow = Window &
  typeof globalThis & {
    showDirectoryPicker?: (options?: {
      mode?: "read" | "readwrite";
    }) => Promise<CourseDirectoryHandle>;
  };

type CourseFileHandle = {
  kind: "file";
  name: string;
  getFile: () => Promise<File>;
};

export type CourseDirectoryHandle = {
  kind: "directory";
  name: string;
  values?: () => AsyncIterable<CourseDirectoryHandle | CourseFileHandle>;
  entries?: () => AsyncIterable<[string, CourseDirectoryHandle | CourseFileHandle]>;
  queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
};

type FileWithRelativePath = File & {
  webkitRelativePath?: string;
};

const DB_NAME = "learnvault-player";
const DB_VERSION = 1;
const HANDLE_STORE = "directory-handles";

export function supportsCourseDirectoryPicker(): boolean {
  if (typeof window === "undefined" || !window.isSecureContext) {
    return false;
  }

  try {
    return window.self === window.top && "showDirectoryPicker" in window;
  } catch {
    return false;
  }
}

function openDirectoryDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(HANDLE_STORE)) {
        database.createObjectStore(HANDLE_STORE);
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function runStoreRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function withHandleStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDirectoryDatabase();

  try {
    const transaction = database.transaction(HANDLE_STORE, mode);
    const store = transaction.objectStore(HANDLE_STORE);
    return await runStoreRequest(action(store));
  } finally {
    database.close();
  }
}

function attachRelativePath(file: File, relativePath: string): FileWithRelativePath {
  try {
    Object.defineProperty(file, "webkitRelativePath", {
      configurable: true,
      value: relativePath,
    });

    return file as FileWithRelativePath;
  } catch {
    const clonedFile = new File([file], file.name, {
      lastModified: file.lastModified,
      type: file.type,
    });

    Object.defineProperty(clonedFile, "webkitRelativePath", {
      configurable: true,
      value: relativePath,
    });

    return clonedFile as FileWithRelativePath;
  }
}

async function walkDirectory(
  directoryHandle: CourseDirectoryHandle,
  pathParts: string[],
  files: FileWithRelativePath[],
): Promise<void> {
  const values = directoryHandle.values;
  const entries = directoryHandle.entries;
  const entryHandles = values
    ? values()
    : entries
      ? (async function* () {
          for await (const [, entryHandle] of entries()) {
            yield entryHandle;
          }
        })()
      : null;

  if (!entryHandles) {
    throw new Error("Directory iteration is not supported in this browser.");
  }

  for await (const entryHandle of entryHandles) {
    if (entryHandle.kind === "directory") {
      await walkDirectory(entryHandle, [...pathParts, entryHandle.name], files);
      continue;
    }

    const file = await entryHandle.getFile();
    const relativePath = [...pathParts, file.name].join("/");
    files.push(attachRelativePath(file, relativePath));
  }
}

export async function readCourseDirectory(
  directoryHandle: CourseDirectoryHandle,
): Promise<File[]> {
  const files: FileWithRelativePath[] = [];
  await walkDirectory(directoryHandle, [directoryHandle.name], files);
  return files;
}

export async function pickCourseDirectory(): Promise<{
  files: File[];
  handle: CourseDirectoryHandle;
} | null> {
  const pickerWindow = window as DirectoryPickerWindow;

  if (!pickerWindow.showDirectoryPicker) {
    return null;
  }

  try {
    const handle = await pickerWindow.showDirectoryPicker({ mode: "read" });
    const files = await readCourseDirectory(handle);
    return { files, handle };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }

    throw error;
  }
}

export async function ensureCourseDirectoryPermission(
  handle: CourseDirectoryHandle,
  requestPermission: boolean,
): Promise<boolean> {
  const descriptor = { mode: "read" as const };

  if (handle.queryPermission) {
    const currentPermission = await handle.queryPermission(descriptor);

    if (currentPermission === "granted") {
      return true;
    }

    if (!requestPermission) {
      return false;
    }
  }

  if (!handle.requestPermission) {
    return true;
  }

  return (await handle.requestPermission(descriptor)) === "granted";
}

export async function saveCourseDirectoryHandle(
  courseId: string,
  handle: CourseDirectoryHandle,
): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return;
  }

  await withHandleStore("readwrite", (store) => store.put(handle, courseId));
}

export async function getCourseDirectoryHandle(
  courseId: string,
): Promise<CourseDirectoryHandle | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return null;
  }

  const handle = await withHandleStore<CourseDirectoryHandle | undefined>(
    "readonly",
    (store) => store.get(courseId),
  );

  return handle ?? null;
}

export async function deleteCourseDirectoryHandle(courseId: string): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return;
  }

  await withHandleStore("readwrite", (store) => store.delete(courseId));
}

export async function clearCourseDirectoryHandles(): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return;
  }

  await withHandleStore("readwrite", (store) => store.clear());
}
