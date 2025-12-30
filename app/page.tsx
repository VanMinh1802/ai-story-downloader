"use client";

import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TaskCardSkeleton } from "@/components/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Lazy load onboarding tour to reduce initial bundle
const OnboardingTour = lazy(() => import("@/components/OnboardingTour"));

// --- Types ---
interface Task {
  id: string;
  type: "extract" | "batch" | "ai";
  status: "queued" | "processing" | "success" | "failed";
  title: string;
  subtitle?: string;
  progress?: number; // 0-100
  data?: any; // Polymorphic: string for extract/ai, array for batch tasks
  timestamp: string;
  error?: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  createdAt: number; // Timestamp for progress calculation
}

// --- Icons ---
const Icons = {
  Bolt: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
      />
    </svg>
  ),
  Layers: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
      />
    </svg>
  ),
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 3.844L18 5.25l-.259-1.406a2.25 2.25 0 00-1.406-1.406L14.75 2.25l1.594-.259a2.25 2.25 0 001.406-1.406L18 0l.259 1.406a2.25 2.25 0 001.406 1.406L21.25 2.25l-1.594.259a2.25 2.25 0 00-1.406 1.406zM18.259 18.844L18 20.25l-.259-1.406a2.25 2.25 0 00-1.406-1.406L14.75 17.25l1.594-.259a2.25 2.25 0 001.406-1.406L18 15l.259 1.406a2.25 2.25 0 001.406 1.406L21.25 17.25l-1.594.259a2.25 2.25 0 00-1.406 1.406z"
      />
    </svg>
  ),
  Play: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
      />
    </svg>
  ),
  Trash: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  ),
  Document: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  ),
  XCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  CheckCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Eye: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Download: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 9.75l-3 3m0 0l3 3m-3-3H12m0 0V3"
      />
    </svg>
  ),
  Copy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  ),
  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  ),
  Sliders: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
      />
    </svg>
  ),
  Link: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    </svg>
  ),
};

export default function Home() {
  // --- STATE: GLOBAL & LAYOUT ---
  const [activeTab, setActiveTab] = useState<"extract" | "batch" | "ai">(
    "extract"
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewingTask, setViewingTask] = useState<Task | null>(null); // For Quick View Modal

  // --- STATE: FORMS ---
  // Extract
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Batch
  const [batchStoryUrl, setBatchStoryUrl] = useState("");
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(10);
  const [batchLoading, setBatchLoading] = useState(false);

  // AI
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFiles, setAiFiles] = useState<{ name: string; content: string }[]>(
    []
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [mergeOutput, setMergeOutput] = useState(false);

  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Auto-trigger onboarding on first visit
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(
      "story-commander-tour-completed"
    );
    if (!hasCompletedTour) {
      setShowOnboarding(true);
    }
  }, []);

  // --- ACTIONS ---
  const addToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = sizeId();
    // Smart duration based on type
    const duration = type === "success" ? 3000 : type === "error" ? 7000 : 5000;
    const createdAt = Date.now();

    setToasts((prev) => [...prev, { id, message, type, duration, createdAt }]);

    // Auto-dismiss after duration
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      duration
    );
  };

  const sizeId = () => Math.random().toString(36).substring(7);

  // Helper to download content
  const downloadContent = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(urlObj);
    document.body.removeChild(a);
  };

  // --- LOGIC: EXTRACTOR ---
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !url.startsWith("http"))
      return addToast("URL không hợp lệ!", "error");

    setLoading(true);
    const taskId = sizeId();

    // Add 'Processing' Task
    const initialTask: Task = {
      id: taskId,
      type: "extract",
      status: "processing",
      title: "Analyzing URL...",
      subtitle: new URL(url).hostname,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTasks((prev) => [initialTask, ...prev]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // VALIDATION: Detect error pages
      const content = data.data.content || "";
      const title = data.data.title || "";
      const errorPatterns = [
        /404/i,
        /error/i,
        /không tồn tại/i,
        /not found/i,
        /trang bạn truy cập/i,
      ];
      const hasError = errorPatterns.some(
        (p) => p.test(title) || p.test(content.slice(0, 500))
      );
      if (hasError || content.length < 100) {
        throw new Error(
          hasError ? "Nội dung không hợp lệ (Error/404)" : "Nội dung quá ngắn"
        );
      }

      // Update Task Success
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "success",
                title: data.data.title || "Untitled Extraction",
                data: data.data.content,
                subtitle: `${(data.data.content.length / 1024).toFixed(1)} KB`,
              }
            : t
        )
      );

      addToast("Extract thành công!", "success");
    } catch (err: unknown) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "failed",
                title: "Extraction Failed",
                error: err instanceof Error ? err.message : "Unknown error",
              }
            : t
        )
      );
      addToast(
        err instanceof Error ? err.message : "An error occurred",
        "error"
      );
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  // --- LOGIC: BATCH ---
  const handleBatchDownload = async () => {
    if (!batchStoryUrl || startChapter > endChapter)
      return addToast("Thông tin Batch không hợp lệ!", "error");

    setBatchLoading(true);
    const totalChapters = endChapter - startChapter + 1;
    const storySlug =
      new URL(batchStoryUrl).pathname.split("/").pop() || "Story";

    // 1. Create Individual Tasks for ALL chapters upfront (Queued state)
    const newTasks: Task[] = [];
    const chapterIds: string[] = [];

    for (let i = startChapter; i <= endChapter; i++) {
      const taskId = sizeId();
      chapterIds.push(taskId);
      newTasks.push({
        id: taskId,
        type: "batch",
        status: "queued", // Init as queued
        title: `Chapter ${i} - ${storySlug}`,
        subtitle: "Waiting in queue...",
        progress: 0,
        timestamp: new Date().toLocaleTimeString(),
        data: null,
      });
    }

    // Add all to state
    setTasks((prev) => [...newTasks, ...prev]);

    const BATCH_SIZE = 3;
    const chapters = Array.from(
      { length: totalChapters },
      (_, i) => startChapter + i
    );

    try {
      for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
        const chunk = chapters.slice(i, i + BATCH_SIZE);
        const chunkTaskIds = chapterIds.slice(i, i + BATCH_SIZE);

        // Set Chunk to Processing
        setTasks((prev) =>
          prev.map((t) =>
            chunkTaskIds.includes(t.id)
              ? {
                  ...t,
                  status: "processing",
                  subtitle: "Fetching content...",
                  progress: 30,
                }
              : t
          )
        );

        await Promise.all(
          chunk.map(async (chapId, idx) => {
            const currentTaskId = chunkTaskIds[idx];
            try {
              const cleanUrl =
                batchStoryUrl.replace(/\.html$/, "") + `/chuong-${chapId}.html`;
              const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: cleanUrl }),
              });
              const data = await res.json();

              if (res.ok) {
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === currentTaskId
                      ? {
                          ...t,
                          status: "success",
                          title: `Chapter ${chapId} - ${
                            data.data.title || "Untitled"
                          }`,
                          subtitle: "Ready to download",
                          progress: 100,
                          data: data.data.content, // Store content directly
                        }
                      : t
                  )
                );
              } else {
                throw new Error(data.error);
              }
            } catch (e: any) {
              console.error(e);
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === currentTaskId
                    ? {
                        ...t,
                        status: "failed",
                        subtitle: "Failed to fetch",
                        error: e.message,
                      }
                    : t
                )
              );
            }
          })
        );

        await new Promise((r) => setTimeout(r, 1000));
      }
      addToast("Batch hoàn tất!", "success");
    } catch (err) {
      console.error(err);
    } finally {
      setBatchLoading(false);
    }
  };

  // --- LOGIC: AI ---
  const handleAiSubmit = async () => {
    if (aiFiles.length === 0 || !aiPrompt.trim())
      return addToast("Thiếu File hoặc Prompt!", "error");

    setAiLoading(true);

    try {
      if (mergeOutput) {
        // MERGE MODE: Combine all files into one request
        const taskId = sizeId();
        setTasks((prev) => [
          {
            id: taskId,
            type: "ai",
            status: "processing",
            title: `AI Task: Merged Context (${aiFiles.length} files)`,
            subtitle: "Generating content...",
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);

        const contentToProcess = aiFiles
          .map((f) => `--- FILE: ${f.name} ---\n${f.content}`)
          .join("\n\n");

        const res = await fetch("/api/ai-process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: aiPrompt, content: contentToProcess }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "success",
                  title: `AI Result: Merged Output`,
                  data: data.data.response,
                  subtitle: "rewritten successfully",
                }
              : t
          )
        );
      } else {
        // BATCH MODE: Process each file individually
        const newTasks = aiFiles.map((file) => ({
          id: sizeId(),
          type: "ai" as const,
          status: "queued" as const,
          title: `AI: ${file.name}`,
          subtitle: "Queued...",
          timestamp: new Date().toLocaleTimeString(),
          fileContent: file.content, // Temp storage
        }));

        setTasks((prev) => [...newTasks, ...prev]);

        // Process sequentially to avoid rate limits (or parallel if robust)
        for (const task of newTasks) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? { ...t, status: "processing", subtitle: "Processing..." }
                : t
            )
          );

          try {
            const res = await fetch("/api/ai-process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: aiPrompt,
                content: task.fileContent,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setTasks((prev) =>
              prev.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      status: "success",
                      data: data.data.response,
                      subtitle: "Completed",
                    }
                  : t
              )
            );
          } catch (err: unknown) {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      status: "failed",
                      error:
                        err instanceof Error ? err.message : "Unknown error",
                      subtitle: "Failed",
                    }
                  : t
              )
            );
          }
        }
      }
      addToast("AI Processing Complete!", "success");
    } catch (err: unknown) {
      addToast(
        err instanceof Error ? err.message : "An error occurred",
        "error"
      );
    } finally {
      setAiLoading(false);
    }
  };

  // --- UI HELPERS ---
  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDownloadTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const task = tasks.find((t) => t.id === id);
    if (!task || !task.data) return;

    if (task.type === "batch") {
      // Batch Download Logic (Zip would be better, but loop for now)
      task.data.forEach((item: { filename: string; content: string }) =>
        downloadContent(item.filename, item.content)
      );
    } else {
      downloadContent(
        `${task.title.replace(/[^a-z0-9]/gi, "_")}.txt`,
        task.data
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: { name: string; content: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 1024 * 1024) {
        addToast("File > 1MB", "error");
        continue;
      }
      newFiles.push({ name: files[i].name, content: await files[i].text() });
    }
    setAiFiles((prev) => [...prev, ...newFiles]);
    setActiveTab("ai"); // Switch to AI tab to show dropped files
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(e.dataTransfer.files);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set false if leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setAiFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadAll = () => {
    // Filter tasks that have data (content)
    const successfulTasks = tasks.filter(
      (t) => t.status === "success" && t.data
    );

    if (successfulTasks.length === 0) {
      addToast("No completed tasks available to download.", "info");
      return;
    }

    // Helper to extract chapter number for sorting
    const getChapNum = (title: string) => {
      const match =
        title.match(/(?:Chapter|Chương|Chap)\s*(\d+)/i) ||
        title.match(/^(\d+)/);
      return match ? parseInt(match[1]) : 999999;
    };

    // Sort by Chapter Number Ascending
    const sortedTasks = [...successfulTasks].sort((a, b) => {
      const numA = getChapNum(a.title);
      const numB = getChapNum(b.title);
      if (numA === numB) return 0; // Maintain relative order if no number
      return numA - numB;
    });

    let combinedContent = "";
    sortedTasks.forEach((task: Task) => {
      // Task data is stored in 'data' field. It might be a string or object.
      let content = "";
      if (typeof task.data === "string") {
        content = task.data;
      } else if (typeof task.data === "object") {
        // Handle potential batch data or other objects
        content = JSON.stringify(task.data, null, 2);
      }

      combinedContent += `\n\n=== [${task.title}] ===\n\n`;
      combinedContent += content;
    });

    const blob = new Blob([combinedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `story-commander-merge-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(
      `Downloaded ${successfulTasks.length} tasks (Sorted by Chapter).`,
      "success"
    );
  };

  return (
    <div className="h-screen bg-[#050505] text-gray-300 font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col">
      <style jsx>{`
        .task-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .task-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .task-scroll::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .task-scroll::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      {/* HEADER */}
      <header className="h-14 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded flex items-center justify-center font-bold text-black text-xs">
            S
          </div>
          <h1 className="text-sm font-bold tracking-wide text-white">
            STORY COMMANDER{" "}
            <span className="text-[10px] text-purple-500 ml-1">V2.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
            SYSTEM ONLINE
          </span>

          {/* Help Button - Restart Tour */}
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/50 text-gray-400 hover:text-purple-400 transition-all group relative"
            title="Show Onboarding Tour"
          >
            <span className="text-sm font-bold">?</span>
            {/* Tooltip */}
            <div className="absolute top-full mt-2 right-0 w-32 bg-black border border-purple-500/30 rounded-lg p-2 text-[10px] text-purple-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              Restart Tour
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT: COMMAND CENTER */}
        <section className="lg:col-span-5 bg-[#0a0a0a] border-r border-white/10 flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {["extract", "batch", "ai"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as "extract" | "batch" | "ai")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-white/5 text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-600 hover:text-gray-400 hover:bg-white/[0.02]"
                }`}
              >
                {tab === "extract" && "⚡ Single"}
                {tab === "batch" && "📚 Batch"}
                {tab === "ai" && "✨ AI Studio"}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="p-6 flex-1 overflow-y-auto task-scroll">
            {/* MODE: EXTRACT */}
            {activeTab === "extract" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block">
                    TARGET URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3 pl-10 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <div className="absolute left-3 top-3 text-gray-600">
                      <Icons.Bolt className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? "Scanning..." : "INITIATE EXTRACTION"}
                </button>

                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-300/80 leading-relaxed">
                  <strong>Identify:</strong> Supports standard story sites.{" "}
                  <br />
                  <strong>Action:</strong> Fetches content immediately into the
                  matrix.
                </div>

                {/* RECENT SIGNALS */}
                <div>
                  <label className="text-[10px] font-bold text-gray-600 mb-2 block tracking-wider">
                    RECENT SIGNALS
                  </label>
                  <div className="bg-[#0f0f0f] rounded-lg border border-white/5 p-2 space-y-1">
                    {tasks
                      .filter((t) => t.type === "extract")
                      .slice(0, 3)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 p-2 hover:bg-white/5 rounded transition-colors cursor-default"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === "success"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-[10px] text-gray-400 truncate flex-1">
                            {t.title}
                          </span>
                          <span className="text-[9px] text-gray-600 font-mono">
                            {t.timestamp}
                          </span>
                        </div>
                      ))}
                    {tasks.filter((t) => t.type === "extract").length === 0 && (
                      <div className="text-[10px] text-gray-700 text-center py-2 italic">
                        No recent signals detected.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODE: BATCH */}
            {activeTab === "batch" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block">
                    STORY BASE URL
                  </label>
                  <input
                    type="text"
                    value={batchStoryUrl}
                    onChange={(e) => setBatchStoryUrl(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">
                      START
                    </label>
                    <input
                      type="number"
                      value={startChapter}
                      onChange={(e) => setStartChapter(Number(e.target.value))}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-center focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">
                      END
                    </label>
                    <input
                      type="number"
                      value={endChapter}
                      onChange={(e) => setEndChapter(Number(e.target.value))}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-center focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBatchDownload}
                  disabled={batchLoading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {batchLoading ? "Processing Batch..." : "RUN BATCH SEQUENCE"}
                </button>

                {/* SEQUENCE PREVIEW */}
                <div className="mt-4">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-bold text-gray-600 tracking-wider">
                      SEQUENCE PREVIEW
                    </label>
                    <span className="text-[10px] text-cyan-500 font-mono">
                      Total: {Math.max(0, endChapter - startChapter + 1)} Chaps
                    </span>
                  </div>
                  <div className="bg-[#0f0f0f] rounded-lg border border-white/5 p-3 flex flex-wrap gap-1 max-h-[120px] overflow-y-auto task-scroll">
                    {Array.from(
                      {
                        length: Math.min(
                          50,
                          Math.max(0, endChapter - startChapter + 1)
                        ),
                      },
                      (_, i) => startChapter + i
                    ).map((num) => (
                      <div
                        key={num}
                        className="bg-cyan-900/20 border border-cyan-500/20 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded font-mono"
                      >
                        #{num}
                      </div>
                    ))}
                    {endChapter - startChapter + 1 > 50 && (
                      <span className="text-[9px] text-gray-600 flex items-center px-1">
                        ... +{endChapter - startChapter + 1 - 50} more
                      </span>
                    )}
                    {endChapter < startChapter && (
                      <span className="text-[10px] text-red-500 italic">
                        Invalid Range
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODE: AI STUDIO */}
            {activeTab === "ai" && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300 h-full flex flex-col bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden relative">
                {/* Decorative Header Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 opacity-50"></div>

                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center">
                      <Icons.Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <h2 className="text-sm font-bold tracking-widest text-white">
                      AI STUDIO
                    </h2>
                  </div>
                  <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-500">
                      ONLINE
                    </span>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 task-scroll">
                  {/* Input Data */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 border-l-2 border-purple-500 pl-2">
                        <span className="text-xs font-bold text-gray-300">
                          INPUT DATA
                        </span>
                      </div>
                      <label className="flex items-center gap-1 text-[10px] text-purple-400 font-bold cursor-pointer hover:text-purple-300 transition-colors bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                        <Icons.Document className="w-3 h-3" /> LOAD FILE
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>

                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className={`flex flex-col min-h-[240px] bg-[#050505] rounded-xl border-2 border-dashed transition-all overflow-hidden ${
                        aiFiles.length > 0
                          ? "border-purple-500/30"
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* File List Header */}
                      {aiFiles.length > 0 && (
                        <div className="w-full max-h-[140px] overflow-y-auto task-scroll border-b border-white/5 bg-white/[0.02] p-2 space-y-1">
                          {aiFiles.map((f, i) => (
                            <div
                              key={i}
                              className="bg-purple-900/40 text-purple-200 text-[10px] px-2 py-1.5 rounded border border-purple-500/30 flex items-center justify-between shadow-sm backdrop-blur-sm group/file hover:bg-purple-900/60 transition-colors"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Icons.Document className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[200px]">
                                  {f.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(i);
                                }}
                                className="ml-2 text-gray-400 hover:text-red-400 p-1 rounded hover:bg-black/20 transition-colors"
                                title="Remove file"
                              >
                                <Icons.XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Main Text Input */}
                      <textarea
                        placeholder="Paste your source text here or drag & drop a .txt file..."
                        className="flex-1 w-full bg-transparent p-4 text-xs text-gray-300 placeholder:text-gray-700 resize-none focus:outline-none focus:bg-white/[0.01]"
                      ></textarea>

                      {/* Bottom Footer */}
                      <div className="p-2 flex justify-between text-[10px] text-gray-700 font-mono border-t border-white/5 bg-black/20">
                        <span>{aiFiles.length} files attached</span>
                        <span>Source: Manual / Drag & Drop</span>
                      </div>
                    </div>
                  </div>

                  {/* Directives */}
                  <div>
                    <div className="flex items-center gap-2 border-l-2 border-blue-500 pl-2 mb-2">
                      <span className="text-xs font-bold text-gray-300">
                        DIRECTIVES
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Enter system prompt instructions (e.g., 'Summarize efficiently', 'Make it punchy')..."
                        className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-xs text-gray-300 placeholder:text-gray-700 min-h-[100px] focus:outline-none focus:border-blue-500/30 transition-colors"
                      />
                      <Icons.Sliders className="absolute bottom-3 right-3 w-4 h-4 text-gray-700" />
                    </div>

                    {/* QUICK DIRECTIVES */}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {[
                        {
                          label: "Rewrite Creative",
                          prompt:
                            "Rewrite this text creatively, making it more engaging and descriptive.",
                        },
                        {
                          label: "Summarize",
                          prompt:
                            "Provide a concise summary of the key points in the text.",
                        },
                        {
                          label: "Fix Grammar",
                          prompt:
                            "Proofread the text, correcting any grammatical errors and awkward phrasing.",
                        },
                        {
                          label: "Translate to VN",
                          prompt:
                            "Translate the following text into natural-sounding Vietnamese.",
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setAiPrompt(item.prompt)}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/50 transition-all font-medium"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <input
                      type="checkbox"
                      id="mergeOutput"
                      checked={mergeOutput}
                      onChange={(e) => setMergeOutput(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-purple-500 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="mergeOutput"
                      className="text-[10px] font-bold text-gray-500 cursor-pointer select-none hover:text-gray-300"
                    >
                      MERGE OUTPUT (Combine files into one result)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiSubmit}
                    disabled={aiLoading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-sm text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 group"
                  >
                    {aiLoading ? (
                      <>
                        {" "}
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                        PROCESSING...{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        <Icons.Link className="w-4 h-4 group-hover:rotate-45 transition-transform" />{" "}
                        GENERATE{" "}
                      </>
                    )}
                  </button>
                  <div className="text-center mt-3 text-[10px] font-mono text-gray-600">
                    EST. TIME: ~4.2s
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: UNIFIED RESULT MATRIX */}
        <section className="lg:col-span-7 bg-[#050505] relative flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Task Matrix
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadAll}
                className="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-cyan-400 transition-colors"
                title="Download All (Merged)"
              >
                <Icons.Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tasks.length === 0) {
                    addToast("No tasks to clear", "info");
                    return;
                  }
                  setConfirmDialog({
                    isOpen: true,
                    title: "Clear All Tasks?",
                    message: `This will permanently delete all ${tasks.length} task(s). This action cannot be undone.`,
                    type: "danger",
                    onConfirm: () => {
                      setTasks([]);
                      addToast("All tasks cleared", "success");
                      setConfirmDialog({ ...confirmDialog, isOpen: false });
                    },
                  });
                }}
                className="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-red-400"
                title="Clear All"
              >
                <Icons.Trash className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 task-scroll relative">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center select-none opacity-80 z-10 relative">
                <div className="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none overflow-hidden flex items-center justify-center">
                  {/* Circuit Pattern Background */}
                  <svg
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <pattern
                      id="circuit"
                      x="0"
                      y="0"
                      width="100"
                      height="100"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M10 10h80v80h-80z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                      />
                      <path
                        d="M50 0v100M0 50h100"
                        stroke="currentColor"
                        strokeWidth="0.5"
                      />
                      <circle cx="50" cy="50" r="2" fill="currentColor" />
                      <rect
                        x="20"
                        y="20"
                        width="10"
                        height="10"
                        stroke="currentColor"
                      />
                      <rect
                        x="70"
                        y="70"
                        width="10"
                        height="10"
                        stroke="currentColor"
                      />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#circuit)" />
                  </svg>
                </div>

                <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20 animate-in zoom-in-50 duration-500">
                  <Icons.Layers className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-3xl font-black text-white tracking-tight mb-3">
                  STORY CONTENT COMMANDER
                </h3>
                <p className="text-gray-500 max-w-sm text-sm font-medium leading-relaxed">
                  Select a tool from the{" "}
                  <span className="text-purple-400">Command Center</span> on the
                  left to begin processing content.
                </p>

                <div className="mt-8 flex gap-2">
                  <div className="w-16 h-1 bg-white/5 rounded-full"></div>
                  <div className="w-8 h-1 bg-purple-500 rounded-full"></div>
                  <div className="w-16 h-1 bg-white/5 rounded-full"></div>
                </div>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setViewingTask(task)}
                  className="group relative bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all cursor-pointer flex gap-4 items-center"
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      task.type === "extract"
                        ? "bg-purple-500/10 text-purple-400"
                        : task.type === "batch"
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "bg-pink-500/10 text-pink-400"
                    }`}
                  >
                    {task.type === "extract" && (
                      <Icons.Bolt className="w-5 h-5" />
                    )}
                    {task.type === "batch" && (
                      <Icons.Layers className="w-5 h-5" />
                    )}
                    {task.type === "ai" && (
                      <Icons.Sparkles className="w-5 h-5" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-gray-200 truncate pr-2 group-hover:text-white transition-colors">
                        {task.title}
                      </h3>
                      <span className="text-[10px] text-gray-600 font-mono">
                        {task.timestamp}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500 truncate">
                        {task.subtitle}
                      </p>

                      {/* Status Badge */}
                      <div
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          task.status === "success"
                            ? "bg-green-500/5 text-green-500 border-green-500/20"
                            : task.status === "processing"
                            ? "bg-blue-500/5 text-blue-400 border-blue-500/20"
                            : "bg-red-500/5 text-red-500 border-red-500/20"
                        }`}
                      >
                        {task.status}
                      </div>
                    </div>

                    {/* Progress Bar (Optional) */}
                    {task.progress !== undefined && (
                      <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Actions (Hover) */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-white/5">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadTask(task.id, e)}
                      className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                      title="Download"
                    >
                      <Icons.Document className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
            {/* ONBOARDING TOUR */}
            {showOnboarding && (
              <Suspense
                fallback={
                  <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-white text-sm">Loading tour...</div>
                  </div>
                }
              >
                <OnboardingTour
                  onComplete={() => {
                    setShowOnboarding(false);
                    localStorage.setItem(
                      "story-commander-tour-completed",
                      "true"
                    );
                  }}
                  onSkip={() => {
                    setShowOnboarding(false);
                    localStorage.setItem(
                      "story-commander-tour-completed",
                      "true"
                    );
                  }}
                />
              </Suspense>
            )}
          </div>
        </section>
      </main>

      {/* QUICK VIEW MODAL */}
      {viewingTask && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#151515] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center ${
                    viewingTask.type === "extract"
                      ? "bg-purple-500/20 text-purple-400"
                      : viewingTask.type === "batch"
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-pink-500/20 text-pink-400"
                  }`}
                >
                  {viewingTask.type === "extract" && (
                    <Icons.Bolt className="w-4 h-4" />
                  )}
                  {viewingTask.type === "batch" && (
                    <Icons.Layers className="w-4 h-4" />
                  )}
                </div>
                <h3 className="font-bold text-gray-200">{viewingTask.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <Icons.XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 font-sans text-base text-gray-300 whitespace-pre-wrap leading-loose">
              {viewingTask.status === "processing" ? (
                <div className="flex items-center justify-center h-full text-blue-500 gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>{" "}
                  Processing data...
                </div>
              ) : (
                viewingTask.data || viewingTask.error || "No content available."
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-[#151515] rounded-b-2xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (
                    viewingTask.data &&
                    typeof viewingTask.data === "string"
                  ) {
                    navigator.clipboard.writeText(viewingTask.data);
                    addToast("Copied to clipboard!", "success");
                  }
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Icons.Copy className="w-4 h-4" /> Copy Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="fixed top-6 right-6 z-[110] flex flex-col gap-2">
        {toasts.map((toast) => {
          const progress = toast.duration
            ? Math.max(
                0,
                Math.min(
                  100,
                  ((Date.now() - toast.createdAt) / toast.duration) * 100
                )
              )
            : 0;

          return (
            <div
              key={toast.id}
              className="relative bg-[#111] border border-white/20 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right-10 fade-in overflow-hidden group"
              onMouseEnter={(e) => {
                // Pause auto-dismiss on hover (would need state management for full implementation)
                e.currentTarget.style.animationPlayState = "paused";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animationPlayState = "running";
              }}
            >
              {/* Progress Bar */}
              {toast.duration && toast.duration > 0 && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-100"
                  style={{ width: `${100 - progress}%` }}
                ></div>
              )}

              {toast.type === "success" && (
                <Icons.CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              )}
              {toast.type === "error" && (
                <Icons.XCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
              {toast.type === "info" && (
                <Icons.Eye className="w-5 h-5 text-blue-500 shrink-0" />
              )}
              <span className="text-sm font-medium flex-1">
                {toast.message}
              </span>

              {/* Manual Dismiss Button */}
              <button
                type="button"
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                title="Dismiss"
              >
                <Icons.XCircle className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}
