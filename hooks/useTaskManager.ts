import { useState, useCallback } from "react";
import { Task } from "@/app/types";
import { downloadContent } from "@/app/utils/download";

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const addTasks = useCallback((newTasks: Task[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearTasks = useCallback(() => {
    setTasks([]);
  }, []);

  const downloadTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task || !task.data) return;

      if (task.type === "batch") {
        // Batch Download Logic
        if (Array.isArray(task.data)) {
           task.data.forEach((item: { filename: string; content: string }) =>
            downloadContent(item.filename, item.content)
          );
        } else if (typeof task.data === "string") {
            // Case where batch task represents a single chapter with string content
            const safeTitle = task.title.replace(/[:\\/|?"<>*]/g, "").trim();
            downloadContent(
                `${safeTitle}.txt`,
                task.data
            );
        }
      } else {
        const safeTitle = task.title.replace(/[:\\/|?"<>*]/g, "").trim();
        downloadContent(
          `${safeTitle}.txt`,
          task.data
        );
      }
    },
    [tasks]
  );

  const downloadAllTasks = useCallback(() => {
    const successTasks = tasks.filter((task) => task.status === "success");
    if (successTasks.length === 0) return;

    // Helper to extract chapter number for sorting
    const getChapterNumber = (title: string): number => {
      const match = title.match(/(?:Chapter|Chương)\s*(\d+)/i);
      return match ? parseInt(match[1], 10) : 999999;
    };

    // Sort tasks by chapter number
    const sortedTasks = [...successTasks].sort(
      (a, b) => getChapterNumber(a.title) - getChapterNumber(b.title)
    );

    let mergedContent = "";
    sortedTasks.forEach((task) => {
      // Add a header for each chapter in the merged file
      mergedContent += `\n\n=== ${task.title} ===\n\n`;
      if (typeof task.data === "string") {
        mergedContent += task.data;
      } else if (Array.isArray(task.data)) {
        // Handle rare case of nested batch data (though less likely in this flow)
        task.data.forEach((item) => {
          mergedContent += `\n--- ${item.filename} ---\n${item.content}\n`;
        });
      }
    });

    // Generate a filename based on the first task's story title (simplified) or generic
    const firstTitle = sortedTasks[0]?.title || "Story";
    // Try to extract story name from "Chapter X - Story Name"
    const storyNameMatch = firstTitle.split(" - ")[1] || firstTitle;
    const safeStoryName = storyNameMatch.replace(/[:\\/|?"<>*]/g, "").trim();

    downloadContent(`Full Story - ${safeStoryName}.txt`, mergedContent);
  }, [tasks]);


  return {
    tasks,
    setTasks, // Expose raw setter for complex cases if needed, but prefer helpers
    addTask,
    addTasks,
    updateTask,
    deleteTask,
    clearTasks,
    downloadTask,
    downloadAllTasks
  };
}
