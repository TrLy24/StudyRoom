
## Giới thiệu

**StudyRoom** là ứng dụng di động được xây dựng trên nền tảng **React Native (Expo SDK 57)** hỗ trợ học sinh, sinh viên và giảng viên dễ dàng tìm kiếm, kiểm tra trạng thái và đặt phòng học theo các khung giờ trong ngày. 

Ứng dụng tích hợp lưu trữ cục bộ bảo mật cao với **Expo SQLite**, cơ chế kiểm soát đồng thời (concurrency) chống trùng lịch cấp Database, thông báo nhắc hẹn trước giờ học, cùng giao diện Dark Mode hiện đại và tối ưu trải nghiệm người dùng.

---

## Tính năng nổi bật

### 1. Khám phá & Tìm kiếm phòng học
- **Tìm kiếm tức thì**: Tra cứu phòng theo tên, phòng lab, khu vực thư viện.
- **Bộ lọc thông minh**: Lọc phòng theo toà nhà (`A3`, `B1`, `Thư viện chính`), số lượng chỗ ngồi tối thiểu, hoặc chỉ hiển thị các phòng còn slot trống trong ngày.
- **Lịch chọn ngày linh hoạt**: Dễ dàng chuyển đổi giữa các ngày trong tuần với thanh cuộn ngày trực quan.

### 2. Đặt phòng & Chống trùng lịch (Concurrency-safe)
- **Hiển thị trực quan theo khung giờ (Time Slots)**:
  - **Còn trống**: Sẵn sàng để đặt lịch chỉ với một chạm.
  - **Của bạn**: Đánh dấu các khung giờ bạn đã đặt trước đó.
  - **Đã kín**: Hiển thị tên người dùng đã giữ chỗ, không thể đặt thêm.
- **Ràng buộc kiểm soát xung đột nghiêm ngặt**:
  - **Luật 1 (Tránh trùng cá nhân)**: Một người dùng không thể đặt 2 phòng khác nhau trong cùng một khung giờ (`USER_OVERLAP`).
  - **Luật 2 (Chống Race Condition)**: Sử dụng ràng buộc toàn vẹn `UNIQUE(roomId, date, slot)` ở tầng SQLite Database, đảm bảo an toàn tuyệt đối ngay cả khi nhiều người cùng bấm đặt cùng lúc.

### 3. Thông báo nhắc hẹn thông minh (Smart Notifications)
- Tích hợp `expo-notifications` tự động lên lịch nhắc hẹn trước giờ bắt đầu phòng học **15 phút**.
- Tự động hủy thông báo nhắc nhở khi người dùng bấm huỷ lịch đặt.
- Cấu hình Notification Channel tối ưu cho hệ điều hành Android.

### 4. Quản lý lịch cá nhân (My Bookings)
- Thống kê tổng số lịch đã đặt, số lịch sắp tới và các lịch đã kết thúc.
- Phân nhóm danh sách phòng học sắp diễn ra và đã qua.
- Hỗ trợ thao tác huỷ lịch nhanh gọn kèm hộp thoại xác nhận an toàn.

### 5. Xác thực người dùng đa dạng
- **Đăng nhập Google OAuth 2.0**: Tích hợp `expo-auth-session` lấy thông tin cá nhân và avatar trực tiếp từ Google Account.
- **Tài khoản Demo / Khách**: Chuyển đổi nhanh giữa các tài khoản mẫu (Nam - Người dùng A, Lan - Người dùng B) để dễ dàng thử nghiệm tính năng chống trùng lịch giữa 2 người dùng khác nhau.

### 6. Giao diện Dark Theme hiện đại
- Thiết kế theo phong cách Dark Mode chuyên nghiệp (`#0F172A`, `#1E293B`), các hiệu ứng Glassmorphism và màu sắc phân loại trạng thái rõ nét.
- Micro-animations mượt mà với Animated API (Logo Pulse, Fade & Slide Transitions).

---

## Công nghệ sử dụng

| Công nghệ | Phiên bản | Vai trò |
| :--- | :--- | :--- |
| **React Native** | 0.86 | Nền tảng phát triển ứng dụng di động đa nền tảng |
| **Expo** | ~57.0 | Bộ công cụ phát triển & triển khai ứng dụng |
| **TypeScript** | ~6.0 | Ngôn ngữ phát triển kiểu tĩnh an toàn |
| **Expo SQLite** | ~57.0 | Cơ sở dữ liệu quan hệ cục bộ (hỗ trợ async API & WAL mode) |
| **TanStack React Query** | ^5.104 | Quản lý server state, đồng bộ và caching dữ liệu |
| **Zustand** | ^5.0 | Quản lý state toàn cục (thông tin người dùng hiện tại) |
| **React Navigation** | ^7.x | Quản lý điều hướng Stack & Bottom Tabs |
| **Expo Notifications** | ~57.0 | Xử lý thông báo đẩy và nhắc hẹn cục bộ |
| **Expo Auth Session** | ~57.0 | Xác thực Google OAuth 2.0 |

---

## Cấu trúc dự án

```text
StudyRoom/
├── assets/                  # Icon, hình ảnh ứng dụng
├── src/
│   ├── api/
│   │   ├── db.ts            # Khởi tạo SQLite DB & migration bảng bookings
│   │   ├── mockServer.ts    # Nghiệp vụ xử lý đặt phòng, delay mạng & kiểm tra xung đột
│   │   └── queries.ts       # React Query hooks (useBookings, useCreateBooking, useCancelBooking)
│   ├── auth/
│   │   └── google.ts        # Cấu hình Google OAuth 2.0 Client IDs & fetch profile
│   ├── components/
│   │   ├── FilterModal.tsx  # Modal lọc phòng theo tòa nhà, số chỗ, phòng trống
│   │   └── RoomCard.tsx     # Thẻ hiển thị thông tin phòng học
│   ├── screens/
│   │   ├── LoginScreen.tsx       # Màn hình đăng nhập (Google & Demo users)
│   │   ├── BrowseRoomsScreen.tsx # Màn hình danh sách phòng học & tìm kiếm
│   │   ├── RoomDetailScreen.tsx  # Màn hình chi tiết phòng & chọn slot đặt
│   │   ├── MyBookingsScreen.tsx  # Màn hình quản lý lịch đặt của người dùng
│   │   └── ProfileScreen.tsx     # Màn hình thông tin tài khoản & quản trị DB
│   ├── data.ts              # Dữ liệu tĩnh: danh sách phòng, tòa nhà, slot giờ
│   ├── notifications.ts     # Tiện ích lên lịch & huỷ thông báo nhắc hẹn
│   ├── store.ts             # Zustand store lưu phiên đăng nhập hiện tại
│   ├── theme.ts             # Bảng màu, typography, khoảng cách thiết kế
│   └── types.ts             # Định nghĩa TypeScript interfaces & navigation types
├── App.tsx                  # Component gốc, cấu hình Navigation & Provider
├── app.json                 # Cấu hình Expo, permissions & plugins
├── package.json             # Danh sách thư viện phụ thuộc
└── tsconfig.json            # Cấu hình TypeScript
```

---

## Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Yêu cầu tiên quyết
- Đã cài đặt **Node.js** (Khuyên dùng v18.x trở lên).
- Thiết bị di động đã cài đặt ứng dụng **Expo Go** (tải trên [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) hoặc [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)), hoặc đã cài đặt Android Emulator / iOS Simulator.

### 2. Các bước khởi chạy

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi động Expo Dev Server
npm start
# hoặc:
npx expo start
```

### 3. Xem ứng dụng trên thiết bị
- **Android / iOS thật**: Mở camera hoặc ứng dụng Expo Go quét mã QR hiển thị trên Terminal/trình duyệt.
- **Android Emulator**: Nhấn phím `a` trên Terminal.
- **iOS Simulator** (trên macOS): Nhấn phím `i` trên Terminal.
- **Web**: Nhấn phím `w` trên Terminal.

---

## Cấu hình Google OAuth (Tùy chọn)

Để kích hoạt tính năng **Đăng nhập bằng Google**:

1. Truy cập vào [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một Project mới và bật **Google+ API** hoặc **Google People API**.
3. Vào **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
4. Tạo các Client ID tương ứng:
   - **Android**: Nhập Package Name của bạn (mặc định cấu hình trong `app.json`).
   - **iOS**: Nhập Bundle Identifier.
   - **Web**: Đặt Authorized Redirect URI là `https://auth.expo.io/@<your-expo-username>/StudyRoom` hoặc redirect URI tương ứng.
5. Mở file [src/auth/google.ts](file:///c:/Users/fptsh/Studyroombookingapp/StudyRoom/src/auth/google.ts) và điền các Client ID vào:

```typescript
const ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const IOS_CLIENT_ID     = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const WEB_CLIENT_ID     = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
```

> **Lưu ý:** Nếu chưa cấu hình Client ID, bạn vẫn có thể trải nghiệm toàn bộ các tính năng đặt phòng, hủy phòng, nhắc hẹn thông qua các **Tài khoản Demo** có sẵn ngay tại màn hình đăng nhập.

---

## Kiểm thử xung đột đặt phòng (Concurrency Test)

Để thử nghiệm khả năng chống trùng lịch của hệ thống:
1. Đăng nhập với tài khoản **Nam (Người dùng A)**, chọn một phòng bất kỳ (ví dụ: `Lab A3-101`) vào ngày hôm nay, chọn slot `09:00-11:00` và bấm **Đặt phòng này**.
2. Đăng xuất hoặc chuyển sang tài khoản **Lan (Người dùng B)**.
3. Vào lại cùng phòng `Lab A3-101` tại ngày và khung giờ đó:
   - Bạn sẽ thấy slot đã chuyển sang màu đỏ kèm nhãn **Đã đặt bởi Nam (Người dùng A)** và bị khóa không thể đặt.
4. Thử đặt một phòng khác cùng khung giờ với cùng một tài khoản: Hệ thống sẽ ngăn chặn và cảnh báo lỗi **Trùng lịch cá nhân**.

---

## Giấy phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Chi tiết xem tại [LICENSE](file:///c:/Users/fptsh/Studyroombookingapp/StudyRoom/LICENSE).
