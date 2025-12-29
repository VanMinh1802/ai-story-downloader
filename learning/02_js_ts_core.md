# Bài 2: JavaScript & TypeScript Nâng Cao (Core Stack)

Để xử lý dữ liệu truyện và gọi AI, bạn cần thành thạo JavaScript hiện đại (ES6+) và TypeScript cơ bản.

## 1. Asynchronous Programming (Bất đồng bộ)

Hầu hết mọi việc trong dự án này đều tốn thời gian chờ:
- Tải trang web -> Chờ server trả về.
- Gửi text lên AI -> Chờ AI suy nghĩ.
- Lưu file xuống máy -> Chờ ổ cứng ghi.

Nếu dùng code thường, trình duyệt sẽ bị "đơ". Vì vậy ta dùng `async` và `await`.

### Cú pháp
```typescript
// Định nghĩa hàm bất đồng bộ
async function downloadChapter(chapterId: number) {
  console.log("Đang tải...");
  // 'await' giúp tạm dừng hàm này cho đến khi tải xong, nhưng không làm đơ ứng dụng
  const data = await fetch(\`https://api.com/chapter/\${chapterId}\`);
  return data.json(); // .json() cũng là bất đồng bộ
}

// Gọi hàm
async function main() {
  try {
    const result = await downloadChapter(1);
    console.log("Xong:", result);
  } catch (error) {
    console.error("Lỗi rồi:", error);
  }
}
```

### Promise.all (Chạy song song)
Khi bạn tải 10 chương cùng lúc (Batch Downloader), đừng tải từng cái một (tuần tự) rất lâu. Hãy dùng `Promise.all`.

```typescript
const job1 = downloadChapter(1);
const job2 = downloadChapter(2);
const job3 = downloadChapter(3);

// Chờ cả 3 xong cùng lúc
const allResults = await Promise.all([job1, job2, job3]);
```

## 2. Xử lý Mảng (Array Manipulation)

Dữ liệu truyện thường là một mảng các dòng (paragraph). Bạn cần thạo các hàm sau:

- **`map`**: Biến đổi từng phần tử.
  - Ví dụ: Biến mảng URL `['a.html', 'b.html']` thành mảng Promise tải trang.
- **`filter`**: Lọc bỏ phần tử rác.
  - Ví dụ: Bỏ các dòng quảng cáo "Mời bạn đọc qua app...".
- **`join`**: Nối mảng thành chuỗi.
  - Ví dụ: Nối các đoạn văn lại thành một nội dung chương hoàn chỉnh.

```typescript
const lines = ["  Chào  ", "Quảng cáo nè", "Nội dung chính"];

const cleanText = lines
  .map(line => line.trim())         // 1. Xóa khoảng trắng thừa -> ["Chào", "Quảng cáo nè", "Nội dung chính"]
  .filter(line => !line.includes("Quảng cáo")) // 2. Lọc rác -> ["Chào", "Nội dung chính"]
  .join("\n\n");                    // 3. Nối lại

console.log(cleanText);
```

## 3. TypeScript Interfaces

TypeScript giúp bạn biết object có những thuộc tính gì. Không còn phải đoán mò "cái biến data này có field title không nhỉ?".

```typescript
// Định nghĩa khuôn mẫu
interface StoryChapter {
  title: string;
  content: string; // Nội dung đã lọc
  rawHtml?: string; // Dấu ? nghĩa là có thể không có
}

// Sử dụng
const chap1: StoryChapter = {
  title: "Chương 1",
  content: "Ngày xửa ngày xưa..."
  // Không cần rawHtml cũng được
};

// Nếu gõ chap1.titl -> TypeScript sẽ báo lỗi ngay lập tức (trước khi chạy code)
```

---

## 🎯 Bài Tập Thực Hành 2

Mở file `learning/exercises/02_async_data.ts`.
Đây là một file TypeScript mô phỏng quy trình tải truyện.
Nhiệm vụ của bạn là cài đặt Deno (nếu chưa có) và chạy file này bằng lệnh:

```bash
deno run learning/exercises/02_async_data.ts
```

Nếu chưa cài Deno, bạn có thể copy nội dung file vào [Deno Playground](https://dash.deno.com/playground) hoặc một trình Online Compiler bất kỳ để chạy.
