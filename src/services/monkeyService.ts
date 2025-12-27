import * as cheerio from "cheerio";
import { genation } from "@src/repositories/genation.ts";
import { env } from "@src/config/env.ts";

export const monkeyService = () => {
  // Hàm helper để giải mã CSS content (loại bỏ dấu ngoặc kép, ký tự escape)
  const cleanCssContent = (text: string): string => {
    if (!text) return "";
    // Loại bỏ dấu " hoặc ' ở đầu cuối
    return text.replace(/^['"]|['"]$/g, "").replace(/\\"/g, '"');
  };

  const getMonkeyUrl = async (urls: string[]): Promise<{ title: string; content: string }> => {
    try {
      const url = urls[0];

      // 1. Fetch HTML trang truyện
      const htmlResponse = await fetch(url, {
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
      });
      const htmlText = await htmlResponse.text();

      // Load HTML vào Cheerio để dễ thao tác
      const $ = cheerio.load(htmlText);
      const title = $("title").text().replace("- MonkeyD", "").trim() || "story-content";

      // Map chứa dictionary: className -> text (Ví dụ: { 'class-a': 'Anh' })
      const classMap: Record<string, string> = {};

      let allCssText = "";

      $("style").each((_, el) => {
        allCssText += $(el).html() + "\n";
      });

      const regex =
        /\.([\w\-]+):{1,2}(?:before|after)\s*\{\s*content\s*:\s*(['"])(.*?)\2/gi;

      let match;
      while ((match = regex.exec(allCssText)) !== null) {
        const className = match[1];
        const content = match[3];
        // Chỉ lưu nếu content có giá trị thực (không phải icon code dạng \ea02)
        // Nếu muốn chắc chắn là chữ tiếng Việt, có thể check regex tiếng Việt, nhưng ở đây ta cứ lấy hết text
        if (content && !content.startsWith("\\e")) {
          classMap[className] = cleanCssContent(content);
        }
      }
      // 5. Reconstruct (Tái tạo) lại nội dung văn bản
      let fullContent = "";

      const contentContainer = $(".chapter-content");
      if (contentContainer.length) {
        contentContainer.find("p").each((_, p) => {
          let paragraphText = "";

          // Duyệt qua từng node con trong thẻ <p>
          $(p).contents().each((_, node) => {
            // Nếu là text node bình thường
            if (node.type === "text") {
              // log node text
              paragraphText += $(node).text();
            } // Nếu là thẻ span (thẻ bị giấu chữ)
            else if (node.type === "tag" && node.name === "span") {
              const el = $(node);
              const classes = el.attr("class")?.split(/\s+/) || [];

              // Tìm xem class của span này có trong map CSS không
              for (const cls of classes) {
                if (classMap[cls]) {
                  paragraphText += classMap[cls];
                  break; // Tìm thấy thì dừng
                }
              }
            }
          });

          const trimmedText = paragraphText.trim();
          const normalizedText = trimmedText.replace(/\s+/g, " ");
          
          // Lọc bỏ đoạn mở đầu/kết thúc không mong muốn
          if (
            normalizedText.includes("Mời Quý độc giả vào bên dưới") ||
            normalizedText.includes("để tiếp tục đọc toàn bộ chương truyện") ||
            normalizedText.includes("Truyện được đăng tải duy nhất tại")
          ) {
            return;
          }

          if (trimmedText) {
            fullContent += trimmedText + "\n\n";
          }
        });
      }
      
      if (!fullContent.trim()) {
        return { title, content: "Không tìm thấy nội dung truyện (có thể do selector thay đổi hoặc chặn bot)" };
      }

      console.log("Extracted Content Length:", fullContent.length);
      const contentRewrite = await rewriteContent(fullContent);
      return { 
        title, 
        content: contentRewrite || "Không lấy được nội dung sau khi rewrite" 
      };
    } catch (error) {
      console.error("Lỗi khi fetch truyện:", error);
      return { title: "Error", content: `Error: ${error instanceof Error ? error.message : String(error)}` };
    }
  };

  const rewriteContent = async (content: string) => {
    try {
        const client = genation(env.GENATION_API_KEY);
        const response = await client.chat.completions.create({
        model: "gemini-2.0-flash", // Switching to a safer default for Google's OpenAI compat.
        messages: [
            {
            role: "system",
            content:
                "Bạn là một người viết truyện tiếng Việt, mục đích của bạn là viết lại truyện theo góc nhìn thức nhất cho đọc giả nghe audio truyện, chỉ trả lời đúng mục chính không chào hỏi dẫn dắt",
            },
            { role: "user", content: content },
        ],
        });
        return response.choices[0].message.content;
    } catch (e) {
        console.error("Rewrite error:", e);
        return content; // Fallback to original content on error
    }
  };
  return { getMonkeyUrl };
};
