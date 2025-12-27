import { NextResponse } from "next/server";
import { env } from "@src/config/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import process from "node:process";

export async function POST(request: Request) {
  try {
    const { prompt, content } = await request.json();

    if (!prompt || !content) {
      return NextResponse.json(
        { error: "Prompt and content are required" },
        // deno-lint-ignore no-explicit-any
        { status: 400 } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      );
    }

      // Buộc đọc từ process.env để đảm bảo lấy được biến môi trường của Next.js
    let rawKey = process.env.GENATION_API_KEY || env.GENATION_API_KEY || "";
    
    // Làm sạch: xóa khoảng trắng và dấu ngoặc bao quanh nếu có (xử lý trường hợp "KEY" hoặc 'KEY')
    rawKey = rawKey.trim();
    if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
        rawKey = rawKey.slice(1, -1);
    }
    
    const apiKey = rawKey;
    
    console.log("DEBUG: Using API Key:", apiKey ? `${apiKey.substring(0, 8)}... (Length: ${apiKey.length})` : "NONE");

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.includes("PLACEHOLDER") || apiKey.length < 20) {
         return NextResponse.json(
        { error: `API Key is invalid (Len: ${apiKey.length}). Check GENATION_API_KEY in .env` },
        // deno-lint-ignore no-explicit-any
        { status: 500 } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      );
    }

    // Sử dụng trực tiếp Google SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Các model được cấu hình để thử theo thứ tự (dựa trên danh sách model có sẵn từ API debug)
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-flash-latest"];
    
    const finalPrompt = `System Instruction: You are a helpful AI assistant.\n\nContext:\n${content.substring(0, 50000)}\n\nUser Request: ${prompt}`;

    let aiResponse = "";
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(finalPrompt);
            aiResponse = result.response.text();
            lastError = null;
            break; // Thành công
        } catch (error) {
            console.warn(`Failed with model ${modelName}:`, error);
            lastError = error;
            // Thử model tiếp theo
        }
    }

    if (lastError && !aiResponse) {
        let errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
        
        try {
            // Lấy danh sách model có sẵn để hiển thị cho người dùng
            const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (listResp.ok) {
                 const listData = await listResp.json();
                 const modelNames = listData.models?.map((m: { name: string }) => m.name.replace('models/', '')) || [];
                 errorMsg += `\n\nAVAILABLE MODELS for this key: ${modelNames.join(', ')}`;
            } else {
                errorMsg += `\n\n(Could not list models: ${listResp.status} ${listResp.statusText})`;
            }
        } catch (listErr) {
             errorMsg += `\n\n(Failed to fetch models list: ${listErr})`;
        }

        return NextResponse.json(
            { error: errorMsg },
            // deno-lint-ignore no-explicit-any
            { status: 500 } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        response: aiResponse
      }
    });

  } catch (error) {
    console.error("AI FATAL ERROR (Google SDK):", error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process with AI" },
      // deno-lint-ignore no-explicit-any
      { status: 500 } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  }
}
