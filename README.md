# Vietnamese Todo App 🚀

Ứng dụng Todo List tiếng Việt với timer countdown, thông báo âm thanh, và xuất báo cáo chi tiết.

## ✨ Tính năng chính

### 🎯 Quản lý Todo với Timer
- ✅ Thêm công việc mới với tên và thời gian (phút/giây)
- ✅ Bắt đầu/dừng timer cho từng todo
- ✅ Countdown real-time hiển thị thời gian còn lại
- ✅ Tự động hoàn thành khi hết thời gian
- ✅ Chỉ cho phép 1 todo chạy cùng lúc

### 🎨 Giao diện người dùng
- 📱 Responsive design với Tailwind CSS
- 🎨 Modern UI sử dụng shadcn/ui components
- 🇻🇳 Giao diện hoàn toàn bằng tiếng Việt
- 🔔 Toast notifications cho các thao tác
- 💬 Dialog/Alert dialogs cho xác nhận hành động

### 💾 Quản lý dữ liệu
- 💾 Local Storage - lưu trữ dữ liệu locally
- 📅 Theo ngày - tổ chức todo theo từng ngày
- 🗑️ Xóa todo cũ - dọn dẹp dữ liệu cũ
- ✅ Đánh dấu hoàn thành - toggle trạng thái

### 🔊 Tính năng bổ sung
- 👤 Cá nhân hóa - đặt tên người dùng
- 🔊 Âm thanh thông báo - bật/tắt âm thanh khi hết giờ
- ⏰ Countdown popup - hiển thị timer lớn khi đang chạy
- 📊 Xuất báo cáo - xuất todo cũ ra file text trước khi xóa

## 🛠️ Công nghệ sử dụng

- **Next.js 15** - React framework
- **TypeScript** - type safety
- **Tailwind CSS** - styling
- **shadcn/ui** - component library
- **Lucide React** - icons
- **Local Storage** - data persistence

## 🚀 Cài đặt và chạy

```bash
# Clone repository
git clone https://github.com/your-username/vietnamese-todo-app.git
cd vietnamese-todo-app

# Cài đặt dependencies
npm install
# hoặc
yarn install
# hoặc
pnpm install

# Chạy development server
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 📱 Progressive Web App (PWA)

Ứng dụng hỗ trợ PWA với các tính năng:
- 📱 Cài đặt trên mobile/desktop
- 🔄 Offline support
- 📱 App-like experience
- 🔗 Deep linking

## 🎯 Cách sử dụng

### Thêm Todo mới
1. Nhập tên công việc
2. Đặt thời gian (phút/giây)
3. Click "Thêm"

### Bắt đầu Timer
1. Click nút ▶️ bên cạnh todo
2. Countdown popup sẽ hiển thị
3. Âm thanh thông báo khi hết giờ

### Xuất báo cáo
1. Click "📄 Xuất báo cáo" để xuất mà không xóa
2. Click "🗑️ Xóa todo cũ" để xóa và xuất báo cáo

## 📊 Báo cáo chi tiết

File báo cáo bao gồm:
- 📅 Thông tin theo ngày
- ⏱️ Thời gian và trạng thái từng todo
- 📈 Thống kê tổng quan
- 📊 Tỷ lệ hoàn thành

## 🔧 Tùy chỉnh

### Âm thanh
- File âm thanh: `/public/sound-effect-alert.mp3`
- Có thể thay đổi file âm thanh trong `app/page.tsx`

### Giao diện
- Sử dụng Tailwind CSS classes
- Components từ shadcn/ui
- Có thể tùy chỉnh theme trong `globals.css`

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Vui lòng:

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📞 Liên hệ

- 🌐 Website: [https://vietnamese-todo-app.vercel.app](https://vietnamese-todo-app.vercel.app)
- 📧 Email: contact@vietnamese-todo-app.com
- 🐦 Twitter: [@vietnamese_todo_app](https://twitter.com/vietnamese_todo_app)

## 🙏 Cảm ơn

Cảm ơn bạn đã sử dụng Vietnamese Todo App! 🎉

---

**Made with ❤️ for Vietnamese users**
