# Bài 1: Nền Tảng Cào Dữ Liệu (Scraping Foundations)

Để tham gia dự án này, kỹ năng quan trọng nhất không phải là viết code đẹp, mà là **hiểu cách trình duyệt nhìn thấy trang web**.

## 1. DOM là gì? (Document Object Model)

Hãy tưởng tượng trang web như một cái cây (Tree).
- Gốc (Root) là `<html>`.
- Các nhánh là `<body>`, `<head>`.
- Lá là các thẻ `<div>`, `<p>`, `<span>`, `<a>`.

Khi bạn dùng `cheerio` (hoặc `jQuery`), bạn đang đứng từ gốc và dùng "bản đồ" để tìm đến cái lá mình cần.

## 2. CSS Selectors: Tấm bản đồ kho báu

Để lấy đựoc nội dung truyện, bạn cần chỉ cho máy biết nó nằm ở đâu.

| Ký hiệu | Ý nghĩa | Ví dụ HTML | Selector | Kết quả |
| :--- | :--- | :--- | :--- | :--- |
| `.` | Class (Lớp) | `<div class="content">ABC</div>` | `.content` | Chọn div này |
| `#` | ID (Duy nhất) | `<div id="main">XYZ</div>` | `#main` | Chọn div này |
| ` ` (dấu cách) | Con cháu (bên trong sâu) | `<div class="box"><p>Text</p></div>` | `.box p` | Chọn thẻ p nằm trong .box |
| `>` | Con trực tiếp (ngay bên dưới) | `<div class="box"><p>AAA</p></div>` | `.box > p` | Chọn p (nếu nó là con ruột) |

### Ví dụ thực tế trong dự án (`monkeyService.ts`)

Trong dự án `monkeydtruyen`, tác giả dùng selector sau:
```javascript
$(".chapter-content").find("p")
```
-> Nghĩa là: Tìm thẻ có class `chapter-content`, sau đó tìm tất cả thẻ `p` nằm bên trong nó.

## 3. Pseudo-elements (Phần tử giả) - "Bí thuật" của website truyện

Nhiều trang web giấu chữ để chống copy. Họ không viết chữ thẳng vào HTML, mà dùng CSS để "vẽ" chữ lên.

**Ví dụ:**
HTML: `<span class="hidden-text-1"></span>` (Rỗng tuếch!)
CSS:
```css
.hidden-text-1::before {
  content: "Xin chào";
}
```

Khi người dùng nhìn thấy "Xin chào", máy tính (bot) chỉ thấy một thẻ rỗng.
**Cách giải quyết của dự án:**
Code trong `monkeyService.ts` phải tải cả file CSS về, phân tích xem class nào chứa chữ gì (`content: "..."`), rồi điền ngược lại vào HTML.

---

## 🎯 Bài Tập Thực Hành 1

Hãy mở file `learning/exercises/01_selector_practice.html` bằng trình duyệt (Double click vào file).
Sau đó nhấn **F12**, qua tab **Console** và thử dùng lệnh `document.querySelector` để lấy nội dung theo yêu cầu trong file đó.
