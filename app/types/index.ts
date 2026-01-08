export interface Task {
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

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  createdAt: number; // Timestamp for progress calculation
}
