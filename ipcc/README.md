# IPCC 2.0 - Host Shell Application

Ứng dụng Host Shell của hệ thống IPCC 2.0 (Contact Center), tích hợp vi kiến trúc Micro-Frontend qua Module Federation để nạp remote app ProcessX (ticket-flow / web-app).

## 🚀 Tính năng chính
- **Host Shell Framework:** Cấu hình Webpack Module Federation nạp các Remote App độc lập.
- **Dynamic Remote Loading:** Nạp module `ProcessX` (`./ProcessXModule`) từ Remote App tại `localhost:4201` (dev) hoặc domain được cấu hình trong `window.env.SERVICES.PROCESSX_URL`.
- **Hệ thống Menu động:** Hỗ trợ menu IPCC chuẩn hóa (Quản lý tương tác, Gói cước, Monitor, CX Survey, ProcessX, Giám sát,...) lưu trữ và cập nhật qua `localStorage` (không phụ thuộc backend API).
- **Dual Routing:** Hỗ trợ cả đường dẫn trực tiếp `/processX/...` và alias `/procedure-management`, `/process-management`.

## 🛠️ Hướng dẫn chạy

### Cài đặt dependencies (nếu chưa có node_modules)
```bash
npm install
```

### Chạy ứng dụng (Port 4200)
```bash
npm start
```
Ứng dụng sẽ khởi động tại `http://localhost:4200`.
