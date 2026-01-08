import * as cheerio from "cheerio";
import { genation } from "@src/repositories/genation";
import { env } from "@src/config/env";

export const monkeyService = () => {

  // 1. HELPER: Giải mã CSS Content an toàn
  const cleanCssContent = (text: string): string => {
    if (!text) return "";
    try {
        const wrapped = text.startsWith('"') || text.startsWith("'") ? text : `"${text}"`;
        const jsonStr = wrapped.replace(/^'|'$/g, '"'); 
        return JSON.parse(jsonStr);
    } catch (e) {
        return text.replace(/^['"]|['"]$/g, "").replace(/\\"/g, '"');
    }
  };

  // 2. WORKER: Lấy nội dung chi tiết chương
  const getMonkeyUrl = async (url: string): Promise<{ title: string; content: string }> => {
    try {
      const htmlResponse = await fetch(url, {
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
      });
      const htmlText = await htmlResponse.text();
      const $ = cheerio.load(htmlText);
      const title = $("title").text().replace("- MonkeyD", "").trim() || "story-content";

      // --- Xử lý CSS Obfuscation ---
      const classMap: Record<string, string> = {};
      let allCssText = "";
      $("style").each((_, el) => { allCssText += $(el).html() + "\n"; });

      const regex = /\.([\w\-]+):{1,2}(?:before|after)\s*\{\s*content\s*:\s*(['"])((?:[^\\]|\\.)*?)\2/gi;
      let match;
      while ((match = regex.exec(allCssText)) !== null) {
        const className = match[1];
        const rawContent = match[3];
        if (rawContent && !rawContent.startsWith("\\e") && !rawContent.startsWith("\\f")) {
             const decodedText = cleanCssContent(`"${rawContent}"`);
             if (decodedText) classMap[className] = decodedText;
        }
      }

      // --- Trích xuất nội dung ---
      let fullContent = "";
      const contentContainer = $(".content-container, #content, .reading-content, .chapter-c");
      
      if (contentContainer.length) {
         contentContainer.find("script, style, .ads, div[class*='ads'], .chapter-nav, .nav-chapter").remove();

         contentContainer.find("p").each((_, p) => {
             let paragraphText = "";
             $(p).contents().each((_, node) => {
                 if (node.type === "text") {
                     paragraphText += $(node).text();
                 } else if (node.type === "tag" && node.name === "span") {
                     const el = $(node);
                     const classes = el.attr("class")?.split(/\s+/) || [];
                     let injected = false;
                     for (const cls of classes) {
                         if (classMap[cls]) {
                             paragraphText += classMap[cls];
                             injected = true;
                             break;
                         }
                     }
                     if (!injected) paragraphText += el.text();
                 } else if (node.type === "tag" && node.name === "br") {
                     paragraphText += "\n";
                 } else if (node.type === "tag") {
                     paragraphText += $(node).text();
                 }
             });

             const cleanedLine = paragraphText.trim().replace(/\s+/g, " ");
             const lowerLine = cleanedLine.toLowerCase();
             const isSpam = lowerLine.includes("mời quý độc giả") || 
                            lowerLine.includes("shopee") || 
                            lowerLine.includes("đăng tải duy nhất") ||
                            /^(chương|chapter)\s*(trước|sau|tiếp)$/.test(lowerLine);

             if (cleanedLine && !isSpam) {
                 fullContent += cleanedLine + "\n\n";
             }
         });
      }

      if (!fullContent.trim()) {
        return { title, content: "Lỗi: Không tìm thấy nội dung (Selector sai hoặc bị chặn)." };
      }

      // --- AI Rewrite ---
      const contentRewrite = await rewriteContent(fullContent);
      return { 
        title, 
        content: contentRewrite || fullContent 
      };

    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      return { title: "Error", content: "" };
    }
  };

  // 3. AI REWRITE HELPER
  const rewriteContent = async (content: string) => {
    try {
        const client = genation(env.GENATION_API_KEY);
        const response = await client.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: "Bạn là một người viết truyện tiếng Việt, mục đích của bạn là viết lại truyện theo góc nhìn thức nhất cho đọc giả nghe audio truyện, chỉ trả lời đúng mục chính không chào hỏi dẫn dắt" },
                { role: "user", content: content },
            ],
        });
        return response.choices[0].message.content;
    } catch (e) {
        return null;
    }
  };

  // 4. MAIN LOGIC: Lấy danh sách chương (Đã tối ưu)
  const getChapterList = async (url: string, start?: number, end?: number): Promise<{ success: boolean; chapters?: any[]; error?: string }> => {
    try {
      const fetchAndParse = async (pageUrl: string) => {
        const res = await fetch(pageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        });
        const html = await res.text();
        return { $: cheerio.load(html) };
      };

      // Helper Parse "Vét Cạn" (Đã chứng minh hiệu quả)
      const parseChaptersFromDom = ($: cheerio.CheerioAPI) => {
        const items: any[] = [];
        // Ưu tiên class chuẩn
        let listItems = $(".list-chapter li a, .chapter-list a, .row-chapter a, ul.list-chapter a, #list-chapter a, .list-chapters a");
        
        // Fallback: Quét rộng nếu không thấy
        if (listItems.length === 0) {
            listItems = $(".content-main a, .story-detail a, #content a, body a");
        }

        listItems.each((_, el) => {
          const $el = $(el);
          const href = $el.attr("href");
          const title = $el.text().trim();
          
          if (href && title) {
            const numMatch = title.match(/(?:chương|chapter|c|hồi|quyển)\s*([\d]+)/i) || 
                             href.match(/(?:chuong|chapter)-(\d+)/i) ||
                             title.match(/^(\d+)[:.]/);

            if (numMatch) {
              const isChapterLink = /chương|chapter|hồi/i.test(title) || /chuong|chapter/i.test(href);
              if (isChapterLink) {
                  const fullUrl = href.startsWith("http") ? href : `https://monkeydtruyen.com${href.startsWith("/") ? "" : "/"}${href}`;
                  const chapNum = parseInt(numMatch[1]);
                  if (!items.some(i => i.number === chapNum)) {
                      items.push({ number: chapNum, title, url: fullUrl });
                  }
              }
            }
          }
        });
        return items;
      };

      // --- STEP 1: Fetch Page 1 ---
      const { $ } = await fetchAndParse(url);
      let chapters = parseChaptersFromDom($);

      if (chapters.length === 0) {
          return { success: true, chapters: [] }; 
      }

      // --- STEP 2: Meta Analysis (Total Pages & Sorting) ---
      let totalPages = 1;
      const paginationLinks = $(".pagination a, .page-nav a, .pages a");
      paginationLinks.each((_, el) => {
          const href = $(el).attr("href") || "";
          const text = $(el).text().trim();
          const match = href.match(/page=(\d+)/) || href.match(/\/trang-(\d+)/) || text.match(/^(\d+)$/);
          if (match) {
              const p = parseInt(match[1]);
              if (p > totalPages) totalPages = p;
          }
      });

      const firstChapOnPage1 = chapters[0].number;
      const lastChapOnPage1 = chapters[chapters.length - 1].number;
      const isDescending = firstChapOnPage1 > lastChapOnPage1; 
      const chaptersPerPage = chapters.length;

      // --- STEP 3: Smart Interpolation (Buffer Fetching) ---
      if (start !== undefined && end !== undefined && totalPages > 1) {
          const minOnPage1 = Math.min(...chapters.map(c => c.number));
          const maxOnPage1 = Math.max(...chapters.map(c => c.number));
          const isOutsidePage1 = isDescending ? end < minOnPage1 : end > maxOnPage1;

          if (isOutsidePage1) {
              let targetPage = 1;
              if (isDescending) {
                  const maxGlobal = maxOnPage1; 
                  const diff = maxGlobal - start; 
                  targetPage = 1 + Math.floor(diff / chaptersPerPage);
              } else {
                  targetPage = Math.ceil(start / chaptersPerPage);
              }

              targetPage = Math.max(1, Math.min(targetPage, totalPages));
              
              // Lấy vùng đệm +/- 1 trang
              const pagesToFetch = [targetPage - 1, targetPage, targetPage + 1]
                  .filter(p => p > 1 && p <= totalPages);
              const uniquePages = [...new Set(pagesToFetch)];

              const pagePromises = uniquePages.map(async (p) => {
                  const separator = url.includes("?") ? "&" : "?";
                  const pUrl = `${url}${separator}page=${p}`;
                  const { $ : $p } = await fetchAndParse(pUrl);
                  return parseChaptersFromDom($p);
              });

              const extraChaptersList = await Promise.all(pagePromises);
              extraChaptersList.forEach(list => chapters.push(...list));
          }
      }

      // --- STEP 4: Clean & Return ---
      const uniqueChaps = Array.from(new Map(chapters.map(item => [item.number, item])).values());
      uniqueChaps.sort((a, b) => a.number - b.number);

      let result = uniqueChaps;
      if (start !== undefined) result = result.filter(c => c.number >= start);
      if (end !== undefined) result = result.filter(c => c.number <= end);

      return { success: true, chapters: result };

    } catch (error) {
      console.error("Error fetching chapter list:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  return { getMonkeyUrl, getChapterList };
};