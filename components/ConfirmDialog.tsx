import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onConfirm();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const colorClasses = {
    danger: "from-red-600 to-pink-600 hover:shadow-red-500/40",
    warning: "from-orange-600 to-yellow-600 hover:shadow-orange-500/40",
    info: "from-purple-600 to-cyan-600 hover:shadow-purple-500/40",
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Dialog */}
      <div className="relative bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 fade-in duration-200">
        {/* Title */}
        <h3 className="text-xl font-black text-white mb-2">{title}</h3>

        {/* Message */}
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold text-white transition-colors"
            autoFocus
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 bg-gradient-to-r ${colorClasses[type]} rounded-lg text-sm font-bold text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all`}
          >
            {confirmText}
          </button>
        </div>

        {/* Keyboard Hint */}
        <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-[10px] text-gray-600">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">
              Enter
            </kbd>{" "}
            to confirm
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">
              Esc
            </kbd>{" "}
            to cancel
          </span>
        </div>
      </div>
    </div>
  );
}
