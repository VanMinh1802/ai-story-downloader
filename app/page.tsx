"use client";

import React, { useState } from "react";

// --- Types ---
interface AnalysisResult {
  title: string;
  description: string;
  url: string;
  content?: string; // Added for Drag & Drop
}

interface AiFile {
  name: string;
  content: string;
}

// Replaces LogEntry with a richer Job type
interface BatchJob {
    id: string;
    name: string;
    status: 'queued' | 'processing' | 'success' | 'failed';
    progress: number;
    total: number;
    processed: number;
    timestamp: string;
    currentChapter?: string; // Added for granular feedback
}

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

// --- Components ---

// 1. Icon Components (Inline SVG for portability)
const Icons = {
    Bolt: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
    ),
    Layers: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg>
    ),
    Sparkles: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 3.844L18 5.25l-.259-1.406a2.25 2.25 0 00-1.406-1.406L14.75 2.25l1.594-.259a2.25 2.25 0 001.406-1.406L18 0l.259 1.406a2.25 2.25 0 001.406 1.406L21.25 2.25l-1.594.259a2.25 2.25 0 00-1.406 1.406zM18.259 18.844L18 20.25l-.259-1.406a2.25 2.25 0 00-1.406-1.406L14.75 17.25l1.594-.259a2.25 2.25 0 001.406-1.406L18 15l.259 1.406a2.25 2.25 0 001.406 1.406L21.25 17.25l-1.594.259a2.25 2.25 0 00-1.406 1.406z" /></svg>
    ),
    Play: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
    ),
    Trash: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
    ),
    Document: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
    ),
    XCircle: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    CheckCircle: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    Info: (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )
}

export default function Home() {
  // --- STATE: QUICK EXTRACTOR ---
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentExtracts, setRecentExtracts] = useState<AnalysisResult[]>([]);

  // --- STATE: BATCH MANAGER ---
  const [batchStoryUrl, setBatchStoryUrl] = useState("");
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(10);
  const [batchLoading, setBatchLoading] = useState(false);
  const [jobs, setJobs] = useState<BatchJob[]>([]); 
  const [overallProgress, setOverallProgress] = useState({ current: 0, total: 0, percent: 0, active: false });

  // --- STATE: AI STUDIO ---
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFiles, setAiFiles] = useState<AiFile[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState("");
  const [mergeOutput, setMergeOutput] = useState(false);

  // --- STATE: TOAST ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Math.random().toString(36).substring(7);
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000); // Auto close after 3s
  };


  // --- LOGIC: QUICK EXTRACTOR ---
  const processUrl = async (urlToProcess: string, index?: number) => {
    try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToProcess }),
        });
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to analyze URL");
  
        // Download logic
        const blob = new Blob([data.data.content], { type: "text/plain" });
        const urlObj = globalThis.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlObj;
        const cleanTitle = (data.data.title || "chapter").replace(/[^a-z0-9\u00C0-\u1EF9 ]/gi, '_'); 
        
        // Prefix filename with Chapter Index
        const prefix = index ? `Chapter ${index} - ` : '';
        a.download = `${prefix}${cleanTitle}.txt`;
        
        document.body.appendChild(a);
        a.click();
        globalThis.URL.revokeObjectURL(urlObj);
        document.body.removeChild(a);
        
        // Update title for Recent Extracts
        if (index) {
            data.data.title = `${prefix}${data.data.title}`;
        }
        
        return data.data;
    } catch (err) {
        throw err;
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!url.trim()) {
        addToast("Vui lòng nhập URL truyện!", "error");
        return;
      }
      if (!url.startsWith("http")) {
         addToast("URL không hợp lệ (phải bắt đầu bằng http/https)", "error");
         return;
      }

      setLoading(true);
      try {
          const res = await processUrl(url);
          if (res) {
            setRecentExtracts(prev => [res, ...prev]);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };


  // --- LOGIC: BATCH MANAGER ---
  const handleBatchDownload = async () => {
    if (!batchStoryUrl) {
        addToast("Vui lòng nhập URL truyện cho Batch Download!", "error");
        return;
    }
    if (startChapter > endChapter) {
        addToast("Chương bắt đầu phải nhỏ hơn hoặc bằng Chương kết thúc!", "error");
        return;
    }
    if (startChapter < 1) {
        addToast("Chương bắt đầu phải lớn hơn 0!", "error");
        return;
    }

    // 1. Prepare Jobs
    const baseUrl = batchStoryUrl.replace(/\.html$/, '');
    const storySlug = new URL(batchStoryUrl).pathname.split('/').pop() || 'Story';
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    
    const newJobs: BatchJob[] = [];
    const chaptersToProcess: { chapId: number; jobId: string }[] = [];

    for (let i = startChapter; i <= endChapter; i++) {
        const jobId = `job-${Date.now()}-${i}`;
        newJobs.push({
            id: jobId,
            name: `Chapter ${i} - ${storySlug}`, 
            status: 'queued',
            progress: 0,
            total: 1,
            processed: 0,
            timestamp: timestamp
        });
        chaptersToProcess.push({ chapId: i, jobId });
    }

    setJobs(prev => [...newJobs, ...prev]);
    setBatchLoading(true);
    
    // Init Progress
    setOverallProgress({ current: 0, total: chaptersToProcess.length, percent: 0, active: true });
    
    try {
        const BATCH_SIZE = 3;
        let batchProcessedCount = 0; 

        for (let i = 0; i < chaptersToProcess.length; i += BATCH_SIZE) {
            const chunk = chaptersToProcess.slice(i, i + BATCH_SIZE);

            // Mark current chunk as processing
            setJobs(prev => prev.map(job => 
                chunk.some(c => c.jobId === job.id) 
                    ? { ...job, status: 'processing', progress: 10 } 
                    : job
            ));

            await Promise.all(
                chunk.map(async ({ chapId, jobId }) => {
                    const chapterUrl = `${baseUrl}/chuong-${chapId}.html`;
                    try {
                        // Simulate "Fetching" progress
                        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, progress: 50, currentChapter: 'Fetching...' } : j));
                        
                        const res = await processUrl(chapterUrl, chapId);
                        
                        // Add to recent extracts
                        if (res) {
                            setRecentExtracts(prev => [res, ...prev]);
                        }
                        
                        // Success
                         setJobs(prev => prev.map(job => 
                            job.id === jobId 
                                ? { ...job, status: 'success', progress: 100, currentChapter: 'Saved' } 
                                : job
                        ));

                    } catch (chapterErr) {
                        console.error(chapterErr);
                        setJobs(prev => prev.map(job => 
                            job.id === jobId 
                                ? { ...job, status: 'failed', currentChapter: 'Failed' } 
                                : job
                        ));
                    } finally {
                        batchProcessedCount++;
                        // Update Overall Progress
                        setOverallProgress(prev => ({
                            ...prev,
                            current: batchProcessedCount,
                            percent: Math.round((batchProcessedCount / prev.total) * 100)
                        }));
                    }
                })
            );

            if (i + BATCH_SIZE < chaptersToProcess.length) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

    } catch (err) {
        console.error("Batch Error", err);
    } finally {
        setBatchLoading(false);
    }
  };


  // --- LOGIC: DRAG & DROP ---
  const handleDragStart = (e: React.DragEvent, item: AnalysisResult) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
        name: item.title,
        content: item.content || ""
    }));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDropZoneDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Internal Drag
    const jsonData = e.dataTransfer.getData("application/json");
    if (jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.content) {
                setAiFiles(prev => [...prev, { name: data.name, content: data.content }]);
                return;
            }
        } catch (err) {
            console.error("Invalid JSON drop", err);
        }
    }

    // External Drop
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        setAiLoading(true);
        const newFiles: AiFile[] = [];
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 1024 * 1024) { // 1MB Limit
                    addToast(`File ${file.name} quá lớn (>1MB). Vui lòng chọn file nhỏ hơn.`, "error");
                    continue;
                }
                const text = await file.text();
                newFiles.push({ name: file.name, content: text });
            }
            setAiFiles(prev => [...prev, ...newFiles]);
        } finally {
            setAiLoading(false);
        }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); 
      e.dataTransfer.dropEffect = "copy";
  };


  // --- LOGIC: AI STUDIO ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAiLoading(true);
    const newFiles: AiFile[] = [];
    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 1024 * 1024) { // 1MB Limit
                 addToast(`File ${file.name} quá lớn (>1MB). Vui lòng chọn file nhỏ hơn.`, "error");
                 continue;
            }
            const text = await file.text();
            newFiles.push({ name: file.name, content: text });
        }
        setAiFiles(newFiles);
    } finally {
        setAiLoading(false);
    }
  };

  const handleAiSubmit = async () => {
    if (aiFiles.length === 0) {
        addToast("Vui lòng chọn hoặc kéo thả ít nhất 1 file!", "error");
        return;
    }
    if (!aiPrompt.trim()) {
        addToast("Vui lòng nhập yêu cầu (Prompt) cho AI!", "error");
        return;
    }
    setAiLoading(true);
    setAiError("");
    setAiResult("");
    
    try {
        let contentToProcess = "";

        if (mergeOutput && aiFiles.length > 1) {
            // MERGE MODE: Join all files with headers
            contentToProcess = aiFiles.map(f => `--- FILE: ${f.name} ---\n${f.content}`).join("\n\n");
        } else {
            // SINGLE MODE: Just take the first one
            contentToProcess = aiFiles[0].content;
        }

         const response = await fetch("/api/ai-process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: aiPrompt, content: contentToProcess }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setAiResult(data.data.response);
    } catch(err) {
        setAiError(err instanceof Error ? err.message : "AI Error");
    } finally {
        setAiLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-purple-500/30">
      
      {/* HEADER */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl">S</div>
                  <h1 className="text-white font-bold text-lg tracking-tight">StoryForge AI</h1>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                  <span className="text-white">Dashboard</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Library</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Templates</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10"></div>
          </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. QUICK EXTRACTOR (Left - 4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
                <section className="bg-[#111] rounded-2xl border border-white/5 p-5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icons.Bolt className="w-24 h-24 text-purple-500" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Icons.Bolt className="w-5 h-5 text-purple-400" />
                            <h2 className="text-white font-bold">Quick Extractor</h2>
                        </div>
                        <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">READY</span>
                    </div>

                    <form onSubmit={handleAnalyze} className="space-y-4 relative z-10">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Source URL</label>
                            <input
                                type="url"
                                required
                                placeholder="https://..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-gray-700 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2.5 rounded-lg text-sm shadow-lg shadow-purple-900/20 hover:shadow-purple-700/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>Extract Content</>
                            )}
                        </button>
                    </form>
                    
                    {/* Recent Extracts */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-3">
                             <h3 className="text-xs font-semibold text-gray-400">Recent Extracts</h3>
                             <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{recentExtracts.length}</span>
                        </div>
                        
                        <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pr-2">
                             {recentExtracts.length === 0 ? (
                                 <p className="text-xs text-gray-600 italic">No files extracted yet.</p>
                             ) : (
                                 recentExtracts.map((item, idx) => (
                                     <div 
                                        key={idx} 
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, item)}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group active:cursor-grabbing"
                                     >
                                         <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                             <Icons.Document className="w-4 h-4" />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <p className="text-sm text-gray-300 truncate group-hover:text-white select-none">{item.title}</p>
                                             <p className="text-[10px] text-gray-600 truncate">{new URL(item.url || "https://example.com").hostname} • Just now</p>
                                         </div>
                                         <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                                     </div>
                                 ))
                             )}
                        </div>
                    </div>
                </section>
            </div>

            {/* 2. BATCH MANAGER (Right - 8 Cols) */}
            <div className="lg:col-span-8">
                <section className="bg-[#111] rounded-2xl border border-white/5 p-1 h-full flex flex-col shadow-xl">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                             <Icons.Layers className="w-5 h-5 text-blue-400" />
                             <h2 className="text-white font-bold">Batch Manager</h2>
                             <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{jobs.length} Jobs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setJobs([])} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-red-400 transition-colors" title="Clear All">
                                <Icons.Trash className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={handleBatchDownload}
                                disabled={batchLoading}
                                className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                            >
                                <Icons.Play className="w-3 h-3" />
                                {batchLoading ? "Queueing..." : "Process Queue"}
                            </button>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0">
                        <div className="md:col-span-8">
                             <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block tracking-wider">Story URL</label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    value={batchStoryUrl}
                                    onChange={(e) => setBatchStoryUrl(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-sm text-blue-100 font-mono focus:border-blue-500/50 focus:outline-none"
                                />
                             </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block tracking-wider">Start</label>
                            <input 
                                type="number" 
                                value={startChapter}
                                onChange={(e) => setStartChapter(Number(e.target.value))}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-sm text-white font-mono text-center focus:border-blue-500/50 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block tracking-wider">End</label>
                            <input 
                                type="number" 
                                value={endChapter}
                                onChange={(e) => setEndChapter(Number(e.target.value))}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded px-3 py-2 text-sm text-white font-mono text-center focus:border-blue-500/50 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Job Status Table */}
                    <div className="flex-1 bg-[#050505] mx-5 mb-5 rounded-lg border border-white/5 overflow-hidden flex flex-col min-h-[300px]">
                        
                        {/* Overall Progress Bar */}
                        {overallProgress.active && (
                            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex justify-between items-center mb-2">
                                     <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                        <span className="text-xs font-bold text-gray-200">Processing Chapter {overallProgress.current}/{overallProgress.total}</span>
                                     </div>
                                     <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">{overallProgress.percent}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" 
                                        style={{ width: `${overallProgress.percent}%` }}
                                     ></div>
                                </div>
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
                            <div className="col-span-4">File Name</div>
                            <div className="col-span-4">Progress</div>
                            <div className="col-span-3">Status</div>
                            <div className="col-span-1 text-right">Action</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent max-h-[400px]">
                            {jobs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-2 opacity-50 p-10">
                                    <Icons.Layers className="w-8 h-8" />
                                    <p>No jobs running</p>
                                </div>
                            ) : (
                                jobs.map((job) => (
                                    <div key={job.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors group">
                                        {/* File Name */}
                                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                                                <Icons.Document className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm text-gray-200 font-medium truncate">{job.name}</p>
                                                <p className="text-[10px] text-gray-600 truncate">TXT • {job.total} Pages</p>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="col-span-4">
                                            <div className="flex justify-between text-[10px] mb-1.5">
                                                <span className="text-gray-500">{job.status === 'processing' ? 'Processing...' : job.status}</span>
                                                <span className="text-gray-300 font-mono">{job.progress}%</span>
                                            </div>
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-300 ${
                                                        job.status === 'failed' ? 'bg-red-500' :
                                                        job.status === 'success' ? 'bg-green-500' :
                                                        'bg-gradient-to-r from-blue-600 to-cyan-400'
                                                    }`}
                                                    style={{ width: `${job.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-3">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${
                                                    job.status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    job.status === 'processing' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse' :
                                                    job.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-gray-800 text-gray-400 border-white/10'
                                                }`}>
                                                    {job.status === 'processing' && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                                                    {job.status}
                                                </span>
                                                {job.currentChapter && (
                                                    <span className="text-[10px] text-gray-500 truncate">{job.currentChapter}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="col-span-1 text-right">
                                            <button type="button" className="text-gray-600 hover:text-white transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>

        {/* 3. AI STUDIO (Bottom - Full Width) */}
        <section className="bg-[#111] rounded-2xl border border-white/5 p-1 shadow-xl flex flex-col">
             <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                        <Icons.Sparkles className="w-5 h-5 text-pink-400" />
                        <h2 className="text-white font-bold">AI Studio</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#0a0a0a] rounded border border-white/10">
                        <span className="text-[10px] bg-purple-500 text-white px-1.5 rounded">v1.2</span>
                        <span className="text-xs text-gray-400">Gemini 2.0 Flash</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-pink-600" checked={mergeOutput} onChange={e => setMergeOutput(e.target.checked)} />
                        <span className="text-xs text-gray-400">Merge Output</span>
                    </label>
                    <button 
                        type="button"
                        onClick={handleAiSubmit}
                        disabled={aiLoading}
                        className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <Icons.Sparkles className="w-3 h-3 text-pink-600" />
                        Generate
                    </button>
                </div>
            </div>

            {/* Flex Layout & Scrollbar */}
            <div className="grid grid-cols-1 md:grid-cols-2 h-[500px] divide-y md:divide-y-0 md:divide-x divide-white/5">
                {/* Left: Input */}
                <div className="p-4 flex flex-col h-full bg-[#0a0a0a]/50">
                    <div className="mb-2 flex justify-between items-center shrink-0">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Input Context</span>
                        {aiFiles.length > 0 && (
                            <button 
                                type="button"
                                onClick={() => setAiFiles([])}
                                className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                            >
                                <Icons.Trash className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>
                    
                    {/* Fix: Enhanced Drop Zone & File List */}
                    <div className="mb-3 shrink-0">
                         <label 
                            onDrop={handleDropZoneDrop}
                            onDragOver={handleDragOver}
                            className={`group relative block w-full border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer overflow-hidden ${
                                aiFiles.length > 0 
                                    ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10" 
                                    : "border-white/10 bg-white/[0.02] hover:border-pink-500/50 hover:bg-white/[0.05]"
                            }`}
                         >
                             <input type="file" multiple className="hidden" onChange={handleFileChange} />
                             
                             {/* Background Icon Effect */}
                             <div className="absolute right-[-20px] bottom-[-20px] opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                 <Icons.Document className="w-32 h-32" />
                             </div>

                             <div className="relative z-10 flex flex-col items-center justify-center min-h-[100px]">
                                 {aiFiles.length > 0 ? (
                                    <div className="w-full space-y-2">
                                        <div className="text-center mb-3">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold">
                                                <Icons.Sparkles className="w-3 h-3" />
                                                {aiFiles.length} Files Ready
                                            </div>
                                        </div>
                                        <div className="max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent space-y-1 pr-1">
                                            {aiFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 rounded bg-black/40 border border-white/5 text-left group/item hover:border-white/20 transition-colors">
                                                    <Icons.Document className="w-3.5 h-3.5 text-gray-500 group-hover/item:text-gray-300" />
                                                    <span className="text-xs text-gray-300 truncate flex-1">{file.name}</span>
                                                    <span className="text-[10px] text-gray-600 font-mono">{(file.content.length / 1024).toFixed(1)}KB</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                 ) : (
                                     <>
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-all duration-300 text-gray-500">
                                            <Icons.Layers className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                            Drop files here to analyze
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Or click to browse (TXT, MD)
                                        </p>
                                     </>
                                 )}
                             </div>
                         </label>
                    </div>

                    <textarea 
                        className="flex-1 w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-4 text-[15px] text-gray-200 font-sans leading-relaxed focus:outline-none focus:border-pink-500/50 resize-none placeholder:text-gray-600 transition-colors"
                        placeholder="Optional prompt guidance..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    ></textarea>
                </div>

                {/* Right: Output */}
                <div className="p-4 flex flex-col h-full bg-[#080808] overflow-hidden">
                    <div className="mb-2 flex justify-between items-center shrink-0">
                         <span className="text-[10px] font-bold text-pink-500 uppercase">• Rewritten Version</span>
                         {aiResult && <button type="button" className="text-[10px] text-gray-500 hover:text-white">Copy</button>}
                    </div>
                    <div className="flex-1 w-full rounded p-4 text-base text-gray-300 font-sans leading-loose overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {aiLoading ? (
                             <div className="h-full flex items-center justify-center gap-2 text-pink-500 animate-pulse">
                                 <Icons.Sparkles className="w-5 h-5" />
                                 <span>AI is thinking...</span>
                             </div>
                        ) : aiError ? (
                            <div className="h-full flex items-center justify-center text-red-400 p-4 text-center">
                                {aiError}
                            </div>
                        ) : aiResult ? (
                            <div className="whitespace-pre-wrap pb-10">{aiResult}</div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-700 italic">
                                // Output will appear here...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>

      </main>

        {/* TOAST CONTAINER */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <div 
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md animate-slide-in min-w-[300px] max-w-[400px] transition-all duration-300 ${
                        toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-200' :
                        toast.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-200' :
                        'bg-blue-500/10 border-blue-500/50 text-blue-200'
                    }`}
                >
                    {toast.type === 'error' && <Icons.XCircle className="w-5 h-5 shrink-0 text-red-500" />}
                    {toast.type === 'success' && <Icons.CheckCircle className="w-5 h-5 shrink-0 text-green-500" />}
                    {toast.type === 'info' && <Icons.Info className="w-5 h-5 shrink-0 text-blue-500" />}
                    
                    <span className="text-sm font-medium">{toast.message}</span>
                    
                    <button 
                        onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        className="ml-auto text-white/50 hover:text-white"
                        type="button"
                    >
                        <Icons.XCircle className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
}
