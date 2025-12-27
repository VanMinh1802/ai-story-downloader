"use client";

import { useState } from "react";

interface AnalysisResult {
  title: string;
  description: string;
  url: string;
}

interface AiFile {
    name: string;
    content: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const processUrl = async (urlToProcess: string, index?: number) => {
      setLoading(true);
      setError("");
      // Chỉ xóa kết quả nếu ở chế độ đơn lẻ
      if (!index) setResult(null);
  
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToProcess }),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || "Failed to analyze URL");
        }
  
        // Tự động tải xuống
        const blob = new Blob([data.data.content], { type: "text/plain" });
        const urlObj = globalThis.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlObj;
        // Dùng tiêu đề sạch (giới hạn ký tự) hoặc mặc định
        const cleanTitle = (data.data.title || "chapter").replace(/[^a-z0-9\u00C0-\u1EF9 ]/gi, '_'); 
        a.download = `${index ? `Chapter_${index}_` : ''}${cleanTitle}.txt`;
        document.body.appendChild(a);
        a.click();
        globalThis.URL.revokeObjectURL(urlObj);
        document.body.removeChild(a);
  
        return data.data; // Trả về để xử lý hàng loạt
      } catch (err) {
        throw err;
      } finally {
        if (!index) setLoading(false); // Chỉ tắt loading nếu ở chế độ đơn lẻ
      }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await processUrl(url);
          setResult(res);
      } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
      }
  };

  // State cho xử lý hàng loạt
  const [batchStoryUrl, setBatchStoryUrl] = useState("");
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(10);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");

  const handleBatchDownload = async () => {
    if (!batchStoryUrl) {
        setError("Please enter a story URL");
        return;
    }

    setBatchLoading(true);
    setBatchProgress("Starting...");
    setError("");

    try {
        // Xây dựng URL gốc: bỏ đuôi .html nếu có
        // Ví dụ: .../story-name.html -> .../story-name
        const baseUrl = batchStoryUrl.replace(/\.html$/, '');

        for (let i = startChapter; i <= endChapter; i++) {
            setBatchProgress(`Processing Chapter ${i}...`);
            const chapterUrl = `${baseUrl}/chuong-${i}.html`;
            
            try {
                await processUrl(chapterUrl, i);
            } catch (chapterErr) {
                console.error(`Failed chapter ${i}:`, chapterErr);
                // Tiếp tục hay dừng? Ghi log và tiếp tục
                setBatchProgress(`Error on Chapter ${i}, continuing...`);
            }
            
            // Delay nhỏ để tránh spam request
            await new Promise(r => setTimeout(r, 1000));
        }
        setBatchProgress("All chapters processed!");
    } catch (err) {
        setError("Batch failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
        setBatchLoading(false);
    }
  };

  // State cho xử lý AI
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFiles, setAiFiles] = useState<AiFile[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiProgress, setAiProgress] = useState("");
  const [mergeOutput, setMergeOutput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setAiLoading(true);
    setAiError("");
    const newFiles: AiFile[] = [];

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const text = await file.text();
            newFiles.push({ name: file.name, content: text });
        }
        setAiFiles(newFiles);
    } catch (err) {
        setAiError("Failed to read files");
        console.error(err);
    } finally {
        setAiLoading(false);
    }
  };

  const sortFiles = (files: AiFile[]) => {
      return [...files].sort((a, b) => {
          // Trích xuất số từ "Chapter_123_"
          const getNum = (name: string) => {
              const match = name.match(/Chapter_(\d+)/i);
              return match ? parseInt(match[1], 10) : -1;
          };
          
          const numA = getNum(a.name);
          const numB = getNum(b.name);

          // Nếu cả hai đều có số, sắp xếp theo số
          if (numA !== -1 && numB !== -1) return numA - numB;
          
          // Fallback về sắp xếp chuỗi
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiFiles.length === 0 || !aiPrompt) {
        setAiError("Please upload files and enter a prompt");
        return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResult("");
    setAiProgress(`Starting batch processing of ${aiFiles.length} files...`);
    
    // Sắp xếp file trước khi xử lý
    const sortedFiles = sortFiles(aiFiles);
    const mergedResults: string[] = [];

    try {
        for (let i = 0; i < sortedFiles.length; i++) {
            const file = sortedFiles[i];
            setAiProgress(`Processing file ${i + 1}/${sortedFiles.length}: ${file.name}...`);

            try {
                 const response = await fetch("/api/ai-process", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: aiPrompt, content: file.content }),
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "AI processing failed");
                
                const aiResponse = data.data.response;
                setAiResult(aiResponse); // Hiển thị kết quả mới nhất

                if (mergeOutput) {
                    mergedResults.push(`### ${file.name}\n\n${aiResponse}`);
                } else {
                    // Tự động tải file đã xử lý (Chế độ lẻ)
                    const blob = new Blob([aiResponse], { type: "text/plain" });
                    const url = globalThis.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const baseName = file.name.replace(/\.[^/.]+$/, "");
                    a.download = `${baseName}_AI_Processed.txt`;
                    document.body.appendChild(a);
                    a.click();
                    globalThis.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }

            } catch (fileErr) {
                console.error(`Error processing ${file.name}:`, fileErr);
                setAiError(`Error on file ${file.name}: ${fileErr instanceof Error ? fileErr.message : String(fileErr)}`);
            }
            
            // Delay ngắn
            await new Promise(r => setTimeout(r, 1000));
        }

        if (mergeOutput && mergedResults.length > 0) {
            setAiProgress("Merging and downloading final file...");
            const finalContent = mergedResults.join("\n\n" + "=".repeat(50) + "\n\n");
            
            const blob = new Blob([finalContent], { type: "text/plain" });
            const url = globalThis.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Merged_AI_Output_${new Date().getTime()}.txt`;
            document.body.appendChild(a);
            a.click();
            globalThis.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }

        setAiProgress(`Completed processing ${aiFiles.length} files.`);
    } catch (err) {
        setAiError(err instanceof Error ? err.message : "An error occurred");
    } finally {
        setAiLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 p-4 dark:bg-black gap-10 py-12">
      <main className="w-full max-w-2xl space-y-8">
        
        {/* 1. URL Content Extractor */}
        <section className="space-y-4">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                    1. URL Content Extractor
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Extract content from a URL to a text file.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-zinc-800">
            <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                <label htmlFor="url" className="sr-only">URL</label>
                <input
                    id="url"
                    name="url"
                    type="url"
                    required
                    placeholder="https://monkeydtruyen.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-lg border-0 bg-gray-100 dark:bg-zinc-800 px-4 py-3.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
                />
                </div>
                
                <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                {loading ? "Extracting & Downloading..." : "Extract Content"}
                </button>
            </form>

            {error && (
                <div className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/20">
                    {error}
                </div>
            )}

            {result && !error && (
                <div className="mt-4 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/20">
                    Success! Content extracted from <strong>{result.title}</strong> and downloaded.
                </div>
            )}
            </div>
        </section>

        {/* 2. Batch Chapter Downloader */}
        <section className="space-y-4">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                    2. Batch Chapter Downloader
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Download multiple chapters (e.g. 1-10) automatically.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-zinc-800">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Story URL</label>
                        <input
                            type="text"
                            value={batchStoryUrl}
                            onChange={(e) => setBatchStoryUrl(e.target.value)}
                            placeholder="https://monkeydtruyen.com/thap-nien-quan-hon-vo-beo-ba-dao-cua-thu-truong.html"
                            className="w-full rounded-lg border-0 bg-gray-100 dark:bg-zinc-800 px-4 py-3.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6 transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Chapter</label>
                            <input
                                type="number"
                                value={startChapter}
                                onChange={(e) => setStartChapter(Number(e.target.value))}
                                className="w-full rounded-lg border-0 bg-gray-100 dark:bg-zinc-800 px-4 py-3.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Chapter</label>
                            <input
                                type="number"
                                value={endChapter}
                                onChange={(e) => setEndChapter(Number(e.target.value))}
                                className="w-full rounded-lg border-0 bg-gray-100 dark:bg-zinc-800 px-4 py-3.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    
                    {batchLoading && (
                        <div className="text-blue-600 dark:text-blue-400 font-medium p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            {batchProgress}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleBatchDownload}
                        disabled={batchLoading}
                        className="w-full bg-purple-600 text-white px-6 py-3.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold shadow-sm"
                    >
                        {batchLoading ? "Processing Batch..." : "Download Chapters"}
                    </button>
                </div>
            </div>
        </section>

        {/* 3. AI AI Processor Section */}
        <section className="space-y-4">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                    3. AI Content Processor
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Upload text files (multiple allowed) and process with AI.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-zinc-800">
                <form onSubmit={handleAiSubmit} className="space-y-4">
                    
                    {/* File Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Upload Text Files
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-700 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {aiFiles.length > 0 ? (
                                            <span className="font-semibold text-blue-500">{aiFiles.length} files selected: {aiFiles[0].name} {aiFiles.length > 1 ? `+${aiFiles.length - 1} more` : ""}</span>
                                        ) : (
                                            "Click to upload text files (Unlimited)"
                                        )}
                                    </p>
                                </div>
                                <input id="dropzone-file" type="file" multiple className="hidden" accept=".txt" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {/* Merge Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            id="mergeOutput"
                            type="checkbox"
                            checked={mergeOutput}
                            onChange={(e) => setMergeOutput(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="mergeOutput" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                            Merge all outputs into a single file (Sorted by Chapter)
                        </label>
                    </div>

                    {/* Prompt Input */}
                    <div className="space-y-2">
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            AI Prompt
                        </label>
                        <textarea
                            id="prompt"
                            rows={4}
                            className="block w-full rounded-lg border-0 bg-gray-100 dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 transition-all"
                            placeholder="e.g., Rewrite this chapter..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                    </div>

                    {aiProgress && (
                        <div className="text-blue-600 dark:text-blue-400 font-medium p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            {aiProgress}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={aiLoading}
                        className="flex w-full justify-center rounded-lg bg-green-600 px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {aiLoading ? "Processing Batch..." : "Process All Files"}
                    </button>
                </form>

                {aiError && (
                    <div className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/20">
                        {aiError}
                    </div>
                )}

                {aiResult && (
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Latest AI Response:</h3>
                        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {aiResult}
                        </div>
                    </div>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}
