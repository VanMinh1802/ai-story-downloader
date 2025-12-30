"use client";
import React, { useState } from "react";
interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}
export default function OnboardingTour({
  onComplete,
  onSkip,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(1);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl"></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-6xl h-[80vh] bg-gradient-to-br from-purple-900/20 to-black/40 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Progress Dots */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                step < currentStep
                  ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" // Completed
                  : step === currentStep
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)] scale-125" // Active
                  : "bg-gray-700" // Upcoming
              }`}
            ></div>
          ))}
        </div>

        {/* Step Counter */}
        <div className="absolute top-6 right-6 text-xs font-mono text-gray-500 z-10">
          STEP {currentStep}/4
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 flex gap-6 p-8 pt-20 pb-24 overflow-hidden">
          {/* Left Panel - Content */}
          <div className="flex-1 flex flex-col justify-center overflow-y-auto">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                  WELCOME
                </div>
                <h2 className="text-5xl font-black text-white leading-tight">
                  Welcome,
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Commander!
                  </span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  Prepare to revolutionize your content workflow with the Story
                  Content Commander. Extract, manage, and transform narrative
                  content like never before.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-3 gap-3 mt-8">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 bg-purple-500/20 rounded mb-2 flex items-center justify-center text-purple-400 text-xl">
                      ⚡
                    </div>
                    <div className="text-xs font-bold text-white">Extract</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Ingest raw narratives
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded mb-2 flex items-center justify-center text-cyan-400 text-xl">
                      📚
                    </div>
                    <div className="text-xs font-bold text-white">Manage</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Organize databases
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 bg-pink-500/20 rounded mb-2 flex items-center justify-center text-pink-400 text-xl">
                      ✨
                    </div>
                    <div className="text-xs font-bold text-white">Rewrite</div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      AI refinement
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Command Center */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center text-lg">
                    🎯
                  </div>
                  COMMAND CENTER
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">
                  Your Mission Control:
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    The Command Center
                  </span>
                </h2>
                <p className="text-gray-400 text-base leading-relaxed max-w-lg">
                  Here, you'll orchestrate all your content operations. Swiftly
                  extract single chapters, manage batch processing, or unleash
                  AI to rewrite and enhance your narratives across three
                  powerful modes:{" "}
                  <span className="text-cyan-400 font-semibold">
                    Quick Extractor
                  </span>
                  ,{" "}
                  <span className="text-cyan-400 font-semibold">
                    Batch Manager
                  </span>
                  , and{" "}
                  <span className="text-purple-400 font-semibold">
                    AI Studio
                  </span>
                  .
                </p>

                {/* Mode Cards */}
                <div className="space-y-3 mt-6">
                  <div className="bg-purple-500/10 border-l-4 border-purple-500 rounded-lg p-4 hover:bg-purple-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 text-xl shrink-0">
                        ⚡
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          Quick Extractor
                        </div>
                        <div className="text-xs text-gray-400">
                          Instantly pull raw narrative data from URLs or text
                          snippets. Perfect for on-the-fly ingestion.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-500/10 border-l-4 border-cyan-500 rounded-lg p-4 hover:bg-cyan-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 text-xl shrink-0">
                        📚
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          Batch Manager
                        </div>
                        <div className="text-xs text-gray-400">
                          Process multiple storylines simultaneously. Tag and
                          filter large datasets with surgical precision.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-500/10 border-l-4 border-pink-500 rounded-lg p-4 hover:bg-pink-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 text-xl shrink-0">
                        ✨
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          AI Studio
                        </div>
                        <div className="text-xs text-gray-400">
                          Bring content with LLM superpowers. Rewrite, expand,
                          or summarize with custom prompts.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-400 text-lg">💡</div>
                    <div className="text-xs text-blue-300/80">
                      <strong>Pro Tip:</strong> You can switch between these
                      modes at any time using the sidebar shortcuts (Cmd+1,
                      Cmd+2, Cmd+3).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Workspace Results */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center text-lg">
                    📊
                  </div>
                  WORKSPACE RESULTS
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">
                  Monitor Your Operations:
                  <br />
                  <span className="bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
                    The Workspace Results
                  </span>
                </h2>
                <p className="text-gray-400 text-base leading-relaxed max-w-lg">
                  Track every mission in real-time. See live progress, quickly
                  preview extracted text, and download your finished stories
                  with ease. Your unified task list keeps everything organized.
                </p>

                {/* Feature Highlights */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Status at a Glance
                      </div>
                      <div className="text-xs text-gray-500">
                        Instantly see what's completed, processing, or needs
                        attention.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      ⚡
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Quick Actions
                      </div>
                      <div className="text-xs text-gray-500">
                        Execute commands like Retry, Pause, or Download directly
                        on cards.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Task Cards */}
                <div className="space-y-2 mt-6">
                  <div className="bg-white/5 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-200 truncate">
                        Extraction: Sector 7
                      </div>
                      <div className="text-[10px] text-gray-500">
                        COMPLETE • 14 sec ago
                      </div>
                    </div>
                    <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-bold text-green-500">
                      SUCCESS
                    </div>
                  </div>

                  <div className="bg-white/5 border border-blue-500/30 rounded-lg p-3 flex items-center gap-3 opacity-75">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-300 truncate">
                        Batch Analysis #402
                      </div>
                      <div className="text-[10px] text-gray-500">
                        PROCESSING • 66%
                      </div>
                    </div>
                    <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-bold text-blue-400">
                      RUNNING
                    </div>
                  </div>

                  <div className="bg-white/5 border border-pink-500/30 rounded-lg p-3 flex items-center gap-3 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-400 truncate">
                        AI: Character Arc
                      </div>
                      <div className="text-[10px] text-gray-600">
                        DRAFT • 3 versions
                      </div>
                    </div>
                    <div className="px-2 py-0.5 bg-gray-700/20 border border-gray-600/20 rounded text-[9px] font-bold text-gray-500">
                      IDLE
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Ready to Command */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center text-lg">
                    🚀
                  </div>
                  STEP 4/4: FINALIZATION
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">
                  Ready to
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Command?
                  </span>
                </h2>
                <p className="text-gray-400 text-base leading-relaxed max-w-lg">
                  You're all set to begin your content journey. Dive into the
                  dashboard and experience the future of story content
                  management!
                </p>

                {/* Initialization Status */}
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-3 mt-6">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    Initialization Complete
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Data Source Connected{" "}
                      <span className="ml-auto text-green-500 font-mono text-[10px]">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Workspace Configured{" "}
                      <span className="ml-auto text-green-500 font-mono text-[10px]">
                        Ready
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      AI Model Selected{" "}
                      <span className="ml-auto text-purple-400 font-mono text-[10px]">
                        GPT-4 Loaded
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Status Cards */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 text-lg mx-auto mb-2">
                      ⚡
                    </div>
                    <div className="text-xs font-bold text-white">
                      Extraction
                    </div>
                    <div className="text-[10px] text-green-500 mt-1">
                      Ready for Ingest
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 text-lg mx-auto mb-2">
                      🗄️
                    </div>
                    <div className="text-xs font-bold text-white">
                      Management
                    </div>
                    <div className="text-[10px] text-green-500 mt-1">
                      DB Connected
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 text-lg mx-auto mb-2">
                      ✨
                    </div>
                    <div className="text-xs font-bold text-white">
                      Rewrite AI
                    </div>
                    <div className="text-[10px] text-purple-400 mt-1">
                      Model Loaded
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <div className="text-purple-400 text-lg">🎯</div>
                    <div className="text-xs text-purple-300/80">
                      <strong>Live Session Active:</strong> Ready to transmit
                      data. Join 1,500+ commanders streamlining their content
                      today.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 bg-black/20 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden relative">
            {/* Step 1 Preview: App Logo with Glow */}
            {currentStep === 1 && (
              <div className="flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 fade-in duration-700">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                  {/* Logo */}
                  <div className="relative w-32 h-32 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
                    <div className="text-6xl font-black text-white">S</div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-xl font-black text-white tracking-wider">
                    STORY COMMANDER
                  </div>
                  <div className="text-xs text-purple-400 font-mono">
                    Version 2.0 • Neural Core
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Preview: Command Dashboard Mockup */}
            {currentStep === 2 && (
              <div className="w-full h-full p-8 flex flex-col gap-4 animate-in slide-in-from-right-4 fade-in duration-500">
                {/* Mini Dashboard */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                    <div className="text-3xl mb-1">⚡</div>
                    <div className="text-[10px] text-purple-400 font-bold">
                      EXTRACT
                    </div>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
                    <div className="text-3xl mb-1">📚</div>
                    <div className="text-[10px] text-cyan-400 font-bold">
                      BATCH
                    </div>
                  </div>
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 text-center">
                    <div className="text-3xl mb-1">✨</div>
                    <div className="text-[10px] text-pink-400 font-bold">
                      AI
                    </div>
                  </div>
                </div>

                {/* Fake Input Bar */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500/30 rounded"></div>
                  <div className="flex-1 h-2 bg-white/5 rounded"></div>
                </div>

                {/* Fake Button */}
                <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-purple-300 font-bold">
                    INITIATE COMMAND
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="mt-auto flex gap-2">
                  <div className="flex-1 border-l-2 border-green-500 bg-green-500/5 rounded p-2">
                    <div className="text-[9px] text-green-400 font-mono">
                      READY
                    </div>
                  </div>
                  <div className="flex-1 border-l-2 border-cyan-500 bg-cyan-500/5 rounded p-2">
                    <div className="text-[9px] text-cyan-400 font-mono">
                      STANDBY
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Preview: Task Matrix Mockup */}
            {currentStep === 3 && (
              <div className="w-full h-full p-8 flex flex-col gap-3 animate-in slide-in-from-right-4 fade-in duration-500">
                {/* Fake Task Cards */}
                <div className="bg-white/5 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-white/10 rounded w-3/4"></div>
                    <div className="h-1.5 bg-white/5 rounded w-1/2"></div>
                  </div>
                  <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[8px] text-green-500 font-bold">
                    SUCCESS
                  </div>
                </div>

                <div className="bg-white/5 border border-blue-500/30 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-white/10 rounded w-2/3"></div>
                    <div className="h-1.5 bg-white/5 rounded w-1/3"></div>
                  </div>
                  <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] text-blue-400 font-bold">
                    RUNNING
                  </div>
                </div>

                <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 flex items-center gap-3 opacity-70">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-white/10 rounded w-1/2"></div>
                    <div className="h-1.5 bg-white/5 rounded w-1/4"></div>
                  </div>
                  <div className="px-2 py-1 bg-gray-700/20 border border-gray-600/20 rounded text-[8px] text-gray-500 font-bold">
                    QUEUED
                  </div>
                </div>

                {/* Header Bar */}
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="text-[9px] text-gray-600 font-mono">
                    3 TASKS ACTIVE
                  </div>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 bg-white/5 rounded border border-white/10"></div>
                    <div className="w-5 h-5 bg-white/5 rounded border border-white/10"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 Preview: Success State */}
            {currentStep === 4 && (
              <div className="flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 fade-in duration-700">
                {/* Animated Checkmark Circle */}
                <div className="relative">
                  {/* Pulse Rings */}
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-10 scale-150"></div>

                  {/* Checkmark */}
                  <div className="relative w-32 h-32 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50">
                    <svg
                      className="w-20 h-20 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-black text-green-400 tracking-wider">
                    SYSTEM READY
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    All Cores Online • Neural Link Active
                  </div>
                </div>

                {/* Mini Status Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {["⚡", "🗄️", "✨"].map((icon, i) => (
                    <div
                      key={i}
                      className="bg-green-500/5 border border-green-500/20 rounded-lg p-2 text-center"
                    >
                      <div className="text-lg">{icon}</div>
                      <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm flex justify-between items-center">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold text-white transition-colors"
              >
                ← Previous
              </button>
            )}

            <button
              onClick={() => {
                if (currentStep < 4) {
                  setCurrentStep(currentStep + 1);
                } else {
                  onComplete();
                }
              }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-bold text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
            >
              {currentStep < 4 ? "Next →" : "Enter Dashboard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
