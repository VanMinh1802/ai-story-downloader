import React from "react";

export const TaskCardSkeleton = () => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
    <div className="flex items-start gap-3">
      {/* Icon skeleton */}
      <div className="w-10 h-10 bg-white/10 rounded-lg shrink-0"></div>
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-3 bg-white/5 rounded w-1/2"></div>
      </div>
      
      {/* Status badge skeleton */}
      <div className="w-20 h-6 bg-white/10 rounded"></div>
    </div>
    
    {/* Progress bar skeleton */}
    <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 w-2/3 animate-pulse"></div>
    </div>
  </div>
);

export const InputSkeleton = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-3 bg-white/10 rounded w-1/4"></div>
    <div className="h-10 bg-white/5 border border-white/10 rounded-lg"></div>
  </div>
);

export const ButtonSkeleton = () => (
  <div className="h-12 bg-white/10 rounded-lg animate-pulse"></div>
);
