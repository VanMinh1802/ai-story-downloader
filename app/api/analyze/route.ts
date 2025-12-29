import { NextResponse } from "next/server";
import { monkeyService } from "@src/services/monkeyService";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        // deno-lint-ignore no-explicit-any
        { status: 400 } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      );
    }

    // Basic validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        // deno-lint-ignore no-explicit-any
        { status: 400 } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      );
    }

    const service = monkeyService();
    const result = await service.getMonkeyUrl([url]);

    // Trả về nội dung trực tiếp dạng text để dễ xử lý tải file nếu cần, 
    // hoặc giữ nguyên JSON. Chúng ta giữ JSON để nhất quán nhưng client cần tự xử lý "tạo file".
    // Thực tế, để trả về đúng chuẩn "tệp văn bản", API có thể trả về blob.
    // Nhưng tạo blob ở client dễ hơn.
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
    
    // Return 422 Unprocessable Entity for known extraction errors
    if (errorMessage.includes("Failed to extract") || errorMessage.includes("not found")) {
         return NextResponse.json(
            { error: `Extraction Failed: ${errorMessage}` },
            // deno-lint-ignore no-explicit-any
            { status: 422 } as any
        );
    }

    return NextResponse.json(
      { error: errorMessage },
      // deno-lint-ignore no-explicit-any
      { status: 500 } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  }
}
