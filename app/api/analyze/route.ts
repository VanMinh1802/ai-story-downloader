import { NextResponse } from "next/server";
import { monkeyService } from "@src/services/monkeyService";

// List of domains known to work well with the current extraction logic
const SUPPORTED_DOMAINS = ["truyenfull.vn", "metruyencv.com", "tangthuvien.vn"];

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

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

    // 2. Strict URL Format Validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid URL format. Please enter a valid HTTP/HTTPS URL.",
          code: "INVALID_FORMAT"
        },
        // deno-lint-ignore no-explicit-any
        { status: 400 } as any
      );
    }

    // 3. Protocol Check
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
       return NextResponse.json(
        { 
          success: false,
          error: "Only HTTP and HTTPS protocols are supported.",
          code: "INVALID_PROTOCOL"
        },
        // deno-lint-ignore no-explicit-any
        { status: 400 } as any
      );
    }

    // 4. Domain Validation (Predictive Error Handling)
    const isSupported = SUPPORTED_DOMAINS.some(d => parsedUrl.hostname.includes(d));
    if (!isSupported) {
       // We accept it but warn, or strictly fail. For "Robust Error Handling", failing fast is better 
       // unless we want to allow generic extraction attempts. 
       // Given the user request for "predictive", we should probably warn or block.
       // Let's block for now to prevent "Content Not Found" generic errors.
       return NextResponse.json(
        { 
          success: false,
          error: `Domain '${parsedUrl.hostname}' is not in the supported list (${SUPPORTED_DOMAINS.join(", ")}). Extraction may fail.`,
          code: "DOMAIN_NOT_SUPPORTED",
          supportedDomains: SUPPORTED_DOMAINS
        },
        // deno-lint-ignore no-explicit-any
        { status: 422 } as any
      );
    }

    // 5. Service Execution
    const service = monkeyService();
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
