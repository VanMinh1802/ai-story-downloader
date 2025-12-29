# Bài 3: React & Next.js Căn Bản

Giờ là lúc lắp ghép mọi thứ thành giao diện người dùng.

## 1. JSX: Viết HTML trong JavaScript

Trong React, bạn không tách riêng file HTML và JS. Bạn viết chung:

```tsx
// Đây là JSX, không phải string, cũng không phải HTML thường
const element = <div className="greeting">Hello, world!</div>;
```

**Lưu ý:**
- Dùng `className` thay vì `class`.
- Các sự kiện viết theo kiểu camelCase: `onClick`, `onChange`.

## 2. useState Hook: Trí nhớ của Component

Trang web cần "nhớ" URL người dùng nhập vào, hoặc trạng thái "đang tải". Ta dùng `useState`.

```tsx
import { useState } from 'react';

export default function SearchBar() {
  // [biến chứa giá trị, hàm để thay đổi giá trị]
  const [url, setUrl] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    console.log("Đang xử lý URL:", url);
    // Giả lập xử lý xong sau 2 giây
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div>
      <input 
        type="text" 
        value={url} // Ràng buộc giá trị
        onChange={(e) => setUrl(e.target.value)} // Cập nhật khi gõ
      />
      
      {/* Hiển thị có điều kiện */}
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Đang chạy..." : "Bắt đầu"}
      </button>

      <p>Bạn đang nhập: {url}</p>
    </div>
  );
}
```

## 3. Server Components vs Client Components

Trong dự án `my-next-deno-app` (Next.js 13+), mặc định mọi thứ là **Server Component**.
- **Server Component**: Chạy trên server, gửi HTML về cho trình duyệt. *Không thể click, không thể dùng useState*.
- **Client Component**: Chạy trên browser. *Có tương tác*.

Để biến thành Client Component, bạn phải thêm dòng `"use client";` ở đầu file.
Hãy xem file `app/page.tsx` của dự án, dòng đầu tiên chính là `"use client";`. Tại sao? Vì trang chủ cần `useState` để lưu URL và nút bấm.

## 4. API Routes (Backend trong Frontend)

File `app/api/analyze/route.ts` đóng vai trò là backend server.
Bạn gọi nó từ frontend bằng `fetch`:

```typescript
// Frontend (page.tsx) gọi về Backend
const response = await fetch("/api/analyze", {
  method: "POST",
  body: JSON.stringify({ url: "https://..." })
});
```

---

## 🎯 Bài Tập Thực Hành 3: "Mini Component"

Bạn không cần tạo file mới. Hãy thử sửa trực tiếp file `app/page.tsx` trong dự án của bạn (đừng lo, có thể undo lại được).

1. Chạy dự án: `deno task dev` (hoặc `npm run dev`).
2. Mở `app/page.tsx`.
3. Tìm thẻ `<h1>` (Tiêu đề trang).
4. Thử thêm một đoạn text hiển thị giờ hiện tại.
   - Gợi ý: Tạo một state `time`. Dùng `useEffect` để cập nhật nó mỗi giây. (Khá khó đấy!)
5. Nếu thấy khó, hãy chỉ cần đổi màu nút bấm từ `bg-blue-600` sang `bg-red-500` xem giao diện thay đổi thế nào.

**Mục tiêu:** Hiểu cách code ảnh hưởng trực tiếp lên giao diện.
