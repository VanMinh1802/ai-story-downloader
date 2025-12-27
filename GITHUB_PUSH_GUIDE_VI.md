# Hướng Dẫn Đẩy (Push) Code Lên GitHub

Chào **VanMinh1802**! Vì tôi là AI chạy trong máy bạn nên tôi không thể tự bấm nút "Tạo New Repo" trên trình duyệt của bạn được. Bạn hãy làm theo các bước đơn giản sau nhé.

## Bước 1: Tạo Kho Chứa (Repository) trên GitHub

1.  Truy cập link này: [https://github.com/new](https://github.com/new)
2.  Đăng nhập vào tài khoản **VanMinh1802** của bạn.
3.  Điền thông tin:
    *   **Repository name**: Đặt tên tùy thích, ví dụ: `ai-story-downloader`
    *   **Description**: (Tùy chọn) Ghi là "App tải truyện và xử lý bằng AI với Next.js & Deno".
    *   **Public/Private**: Chọn **Public** (nếu muốn khoe) hoặc **Private** (nếu muốn giấu).
    *   **QUAN TRỌNG**: Đừng tick vào các ô "Add a README", ".gitignore" hay "license" (Vì máy bạn đã có code rồi, tick vào dễ gây xung đột).
4.  Bấm nút xanh **Create repository**.

## Bước 2: Kết Nối Code Của Bạn Với GitHub

Sau khi tạo xong, GitHub sẽ hiện ra một trang có nhiều dòng lệnh. Hãy tìm phần **"…or push an existing repository from the command line"**.

Mở Terminal của VS Code (`Ctrl + ~`) và chạy lần lượt các lệnh sau (Copy và Paste):

1.  **Thêm các file chưa được lưu vào Git**:
    ```bash
    git add .
    ```

2.  **Lưu lại phiên bản hiện tại**:
    ```bash
    git commit -m "Hoan thien tinh nang: Batch Download va AI Process"
    ```

3.  **Đổi tên nhánh chính thành `main` (cho chuẩn quốc tế)**:
    ```bash
    git branch -M main
    ```

4.  **Kết nối với GitHub** (Thay `ai-story-downloader` bằng tên bạn vừa đặt ở Bước 1):
    ```bash
    git remote add origin https://github.com/VanMinh1802/ai-story-downloader.git
    ```
    *(Nếu máy báo lỗi "remote origin already exists", hãy chạy `git remote remove origin` rồi chạy lại lệnh trên)*.

5.  **Đẩy code lên**:
    ```bash
    git push -u origin main
    ```

## Bước 3: Đăng Nhập (Nếu được hỏi)

- Nếu đây là lần đầu bạn push code trên máy này, Git sẽ hiện một cửa sổ (hoặc dòng chữ) yêu cầu đăng nhập.
- Hãy chọn **"Sign in with your browser"** (Đăng nhập bằng trình duyệt) -> Bấm Authorize -> Thành công!

Sau khi chạy xong, bạn F5 lại trang GitHub của mình sẽ thấy toàn bộ code đã nằm trên đó.

---
**Lưu ý an toàn**: File `.gitignore` của bạn đã được cấu hình chuẩn, nên các file nhạy cảm như `.env` (chứa API Key) sẽ **KHÔNG** bị đẩy lên GitHub. Yên tâm nhé!
