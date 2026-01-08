import { useState } from "react";
import { Task } from "@/app/types";

interface UseStoryExtractorProps {
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

export function useStoryExtractor({ addTask, updateTask, addToast }: UseStoryExtractorProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const sizeId = () => Math.random().toString(36).substring(7);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
    addTask(initialTask);

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
        updateTask(taskId, {
            status: "success",
            title: data.data.title || "Untitled Extraction",
            data: data.data.content,
            subtitle: `${(data.data.content.length / 1024).toFixed(1)} KB`,
        });

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
      updateTask(taskId, {
        status: "failed",
        title: "Extraction Failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
      addToast(err.message || "Failed to extract content", "error");
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  return {
    url,
    setUrl,
    loading,
    handleAnalyze,
  };
}
