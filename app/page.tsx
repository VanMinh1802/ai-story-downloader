"use client";

import React, { useState, useEffect } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import TaskCard from "@/components/TaskCard";
import ExtractForm from "@/components/ExtractForm";
import BatchManager from "@/components/BatchManager";
import AIStudio from "@/components/AIStudio";

import TaskList from "@/components/TaskList";
import ThemeToggle from "@/components/ThemeToggle";
import OnboardingTour from "@/components/OnboardingTour";

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
  type: "success" | "error" | "info" | "warning";
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
  const [inputContext, setInputContext] = useState(""); // Manual text input
  const [aiFiles, setAiFiles] = useState<{ name: string; content: string }[]>(
    []
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [mergeOutput, setMergeOutput] = useState(false);

  // Drag & Drop

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
      "story-commander-tour-completed-v2"
    );
    if (!hasCompletedTour) {
      setShowOnboarding(true);
    }
  }, []);

  // --- ACTIONS ---
  const addToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    const id = sizeId();
    // Smart duration based on type
    const duration =
      type === "success"
        ? 3000
        : type === "error" || type === "warning"
        ? 7000
        : 5000;
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

      if (data.success) {
        // VALIDATION: Detect error pages inside content
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
                  subtitle: `${(data.data.content.length / 1024).toFixed(
                    1
                  )} KB`,
                }
              : t
          )
        );

        addToast("Extract thành công!", "success");
      } else {
        // Handle specific error codes
        if (data.code === "DOMAIN_NOT_SUPPORTED") {
          addToast(data.error, "warning");
        }
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (err: any) {
      console.error(err);
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
      addToast(err.message || "Failed to extract content", "error");
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  // --- LOGIC: BATCH ---
  const handleBatchDownload = async () => {
    // VALIDATION
    if (!batchStoryUrl.trim() || !batchStoryUrl.startsWith("http")) {
      return addToast(
        "URL truyện không hợp lệ (phải bắt đầu bằng http)!",
        "error"
      );
    }
    if (startChapter < 1 || endChapter < 1) {
      return addToast("Số chương phải lớn hơn 0!", "error");
    }
    if (startChapter > endChapter) {
      return addToast(
        "Chương bắt đầu phải nhỏ hơn hoặc bằng chương kết thúc!",
        "error"
      );
    }

    const MAX_BATCH_SIZE = 1000;
    const totalChapters = endChapter - startChapter + 1;

    if (totalChapters > MAX_BATCH_SIZE) {
      return addToast(
        `Giới hạn tối đa ${MAX_BATCH_SIZE} chương mỗi lần! (Bạn đang chọn ${totalChapters})`,
        "error"
      );
    }

    const MAX_CHAPTER_NUM = 10000;
    if (endChapter > MAX_CHAPTER_NUM) {
      return addToast(`Số chương quá lớn (Max ${MAX_CHAPTER_NUM})!`, "error");
    }

    setBatchLoading(true);
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

              if (data.success) {
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
                // Determine if retryable or fatal? For batch, we just log valid errors
                if (data.code === "DOMAIN_NOT_SUPPORTED") {
                  // Optional: add a warning toast once, or just log
                  console.warn(`Domain not supported: ${cleanUrl}`);
                }
                throw new Error(data.error || "Batch fetch failed");
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
      addToast(
        err instanceof Error
          ? err.message
          : "An error occurred during batch processing",
        "error"
      );
    } finally {
      setBatchLoading(false);
    }
  };

  // --- LOGIC: AI ---
  const handleAiSubmit = async () => {
    const hasFiles = aiFiles.length > 0;
    const hasManualInput = inputContext.trim().length > 0;

    if ((!hasFiles && !hasManualInput) || !aiPrompt.trim())
      return addToast(
        "Please provide Content (File/Text) and a Prompt!",
        "error"
      );

    setAiLoading(true);

    try {
      if (mergeOutput || (!hasFiles && hasManualInput)) {
        // MERGE MODE: Combine all files + manual input
        const taskId = sizeId();
        setTasks((prev) => [
          {
            id: taskId,
            type: "ai",
            status: "processing",
            title: `AI Task: ${
              hasFiles ? `Merged (${aiFiles.length} files)` : "Manual Input"
            }`,
            subtitle: "Generating content...",
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);

        let contentToProcess = "";
        if (hasManualInput) {
          contentToProcess += `--- MANUAL INPUT ---\n${inputContext}\n\n`;
        }
        if (hasFiles) {
          contentToProcess += aiFiles
            .map((f) => `--- FILE: ${f.name} ---\n${f.content}`)
            .join("\n\n");
        }

        const res = await fetch("/api/ai-process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: aiPrompt, content: contentToProcess }),
        });
        const data = await res.json();

        if (data.success) {
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
          addToast("AI Processing Complete!", "success");
        } else {
          // Handle Cloud/Quota errors specifically
          if (data.code === "CONTENT_TOO_LONG") {
            addToast("Content exceeds limits. Please split files.", "error");
          } else if (res.status === 429) {
            addToast("System Busy (429). Please wait a moment.", "warning");
          } else if (data.code === "INVALID_API_KEY") {
            addToast("Invalid API Key configuration.", "error");
          }
          throw new Error(data.error || "AI processing failed");
        }
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
      // Check for .txt extension
      if (!files[i].name.toLowerCase().endsWith(".txt")) {
        addToast(
          `Skipped "${files[i].name}": Only .txt files are allowed`,
          "error"
        );
        continue;
      }

      if (files[i].size > 1024 * 1024) {
        addToast(`Skipped "${files[i].name}": File > 1MB`, "error");
        continue;
      }
      newFiles.push({ name: files[i].name, content: await files[i].text() });
    }
    setAiFiles((prev) => [...prev, ...newFiles]);
    setActiveTab("ai"); // Switch to AI tab to show dropped files
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    await processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
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
    <div className="h-screen bg-background text-foreground font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col transition-colors duration-300">
      {/* HEADER */}
      <header className="h-14 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a] backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-purple-500/20">
            S
          </div>
          <h1 className="font-bold text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400">
            STORY COMMANDER{" "}
            <span className="text-[10px] text-purple-500 font-mono">v2.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-green-600 dark:text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            SYSTEM ONLINE
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all font-bold text-sm"
            title="Restart Onboarding Tour"
          >
            ?
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT: COMMAND CENTER */}
        <section className="lg:col-span-5 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10 flex flex-col h-full transition-colors duration-300">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-white/10">
            {["extract", "batch", "ai"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as "extract" | "batch" | "ai")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-purple-50 dark:bg-white/5 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
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
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <ExtractForm
                  url={url}
                  setUrl={setUrl}
                  loading={loading}
                  onAnalyze={handleAnalyze}
                />
              </div>
            )}

            {/* MODE: BATCH */}
            {activeTab === "batch" && (
              <BatchManager
                batchStoryUrl={batchStoryUrl}
                setBatchStoryUrl={setBatchStoryUrl}
                startChapter={startChapter}
                setStartChapter={setStartChapter}
                endChapter={endChapter}
                setEndChapter={setEndChapter}
                loading={batchLoading}
                onRunBatch={handleBatchDownload}
              />
            )}

            {/* MODE: AI STUDIO */}
            {activeTab === "ai" && (
              <AIStudio
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                inputContext={inputContext}
                setInputContext={setInputContext}
                aiFiles={aiFiles}
                setAiFiles={setAiFiles}
                mergeOutput={mergeOutput}
                setMergeOutput={setMergeOutput}
                loading={aiLoading}
                onSubmit={handleAiSubmit}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onFileSelect={handleFileSelect}
                addToast={addToast}
              />
            )}
          </div>
        </section>

        <TaskList
          tasks={tasks}
          onDownload={handleDownloadTask}
          onDelete={handleDeleteTask}
          onDownloadAll={handleDownloadAll}
          onClearAll={() => {
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
          addToast={addToast}
          TaskCardComponent={TaskCard}
        />
      </main>

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
              {toast.type === "warning" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-amber-500 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
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
      {/* ONBOARDING TOUR */}
      {showOnboarding && (
        <OnboardingTour
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem("story-commander-tour-completed-v2", "true");
          }}
          onSkip={() => {
            setShowOnboarding(false);
            localStorage.setItem("story-commander-tour-completed-v2", "true");
          }}
        />
      )}
    </div>
  );
}
