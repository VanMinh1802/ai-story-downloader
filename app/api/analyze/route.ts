import { NextResponse } from "next/server";
import { monkeyService } from "@src/services/monkeyService";

// List of domains known to work well with the current extraction logic
const SUPPORTED_DOMAINS = ["monkeydtruyen.com"];

export async function POST(request: Request) {
  try {
    const { url, type, start, end } = await request.json();

    // 1. Basic Existence Check
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { 
          success: false,
          error: "URL is required and must be a string",
          code: "MISSING_URL"
        },
        // deno-lint-ignore no-explicit-any
        { status: 400 } as any
      );
    }

    // ... (Validation 2, 3, 4 remain same) ...

    // 5. Service Execution
    const service = monkeyService();
    
    // Check if request is for chapter list
    if (type === "list") {
        const listResult = await service.getChapterList(url, start, end);
        return NextResponse.json({
            success: listResult.success,
            data: listResult.chapters
        });
    }

    const result = await service.getMonkeyUrl([url]);

    // 6. Content Validation
    if (!result.content || result.content.includes("Không tìm thấy nội dung")) {
       return NextResponse.json(
        { 
            success: false,
            error: "Content extraction failed. The chapter content could not be found via selectors.",
            code: "CONTENT_NOT_FOUND",
            details: result.content // specific error from service
        },
        // deno-lint-ignore no-explicit-any
        { status: 422 } as any
       );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        title: result.title,
        content: result.content,
        url
      }
    });

  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze URL";
    
    return NextResponse.json(
      { 
          success: false,
          error: errorMessage,
          code: "INTERNAL_SERVER_ERROR"
      },
      // deno-lint-ignore no-explicit-any
      { status: 500 } as any
    );
  }
}
