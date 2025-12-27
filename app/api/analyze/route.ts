import { NextResponse } from "next/server";
import { monkeyService } from "@src/services/monkeyService.ts";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        // @ts-expect-error: ResponseInit type mismatch
        { status: 400 }
      );
    }

    // Basic validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        // @ts-expect-error: ResponseInit type mismatch
        { status: 400 }
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze URL" },
      // @ts-expect-error: ResponseInit type mismatch
      { status: 500 }
    );
  }
}
