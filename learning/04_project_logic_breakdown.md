# Bài 4: Giải Phẫu Logic Dự Án (Case Study)

Bài này sẽ giúp bạn đọc hiểu "trái tim" của dự án: file `src/services/monkeyService.ts`.
Đây là nơi kết hợp tất cả kiến thức bạn đã học.

## 1. Quy trình của `monkeyService`

File này làm 3 việc chính:
1. **Fetch**: Tải HTML trang truyện về.
2. **Decrypt CSS**: Giải mã các chữ bị giấu.
3. **Rewrite**: Gửi nội dung cho AI viết lại.

### Bước 1: Fetch và Cheerio (Ôn lại bài 1)
```typescript
const htmlResponse = await fetch(url, { headers: { "User-Agent": "..." } });
const htmlText = await htmlResponse.text();
const $ = cheerio.load(htmlText);
```
-> Tác giả giả danh trình duyệt (User-Agent) để tránh bị chặn.

### Bước 2: Kỹ thuật Giải Mã CSS (Phần khó nhất)

Trang web dùng một map: class tên là `abc` sẽ hiện ra chữ `A`.
Code làm như sau:

1. **Lấy tất cả CSS**:
   ```typescript
   $("style").each(...) // Tìm thẻ <style>
   ```
2. **Dùng Regex để tách map**:
   Tác giả dùng Regular Expression (Biểu thức chính quy) để tìm đoạn `content: "..."`.
   ```typescript
   // Tìm tất cả dòng có dạng: .tên-class:before { content: "chữ" }
   const regex = /\.([\w\-]+):{1,2}(?:before|after)\s*\{\s*content\s*:\s*(['"])(.*?)\2/gi;
   ```
   -> Kỹ năng cần học: **Regex**. (Bạn có thể tra Google "Regex 101" để học thử).

3. **Reconstruct (Tái tạo văn bản)**:
   Duyệt qua từng đoạn văn (`p`).
   - Nếu là chữ thường -> Lấy luôn.
   - Nếu là thẻ `span` -> Tra cứu trong map CSS xem nó là chữ gì.

```typescript
// Nếu gặp <span class="abc"></span>
if (classMap['abc']) {
    paragraphText += classMap['abc']; // Thêm chữ "A" vào
}
```

### Bước 3: Gọi AI (Genation)

```typescript
const response = await client.chat.completions.create({
    model: "gemini-2.0-flash", 
    messages: [...]
});
```
-> Đây đơn giản là gọi API của Google Gemini.

---

## 🎯 Bài Tập Cuối Khóa

Hãy thử tự tay sửa logic của dự án (một thử thách nhỏ):

1. Mở `src/services/monkeyService.ts`.
2. Tìm đến đoạn `console.log("Extracted Content Length:", fullContent.length);`.
3. Thử thêm một dòng log in ra 100 ký tự đầu tiên của truyện để xem nó lấy được gì.
   ```typescript
   console.log("Preview:", fullContent.substring(0, 100));
   ```
4. Chạy lại tính năng tải truyện và xem Terminal (nơi chạy lệnh `deno task dev`) có hiện ra dòng đó không.

Nếu làm được, chúc mừng! Bạn đã chính thức "chạm" vào source code của dự án mà không làm hỏng nó.
