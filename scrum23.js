// Cấu hình hệ thống
const EVENT_CONFIG = {
    MAX_SLOTS: 50,         // Số lượng giới hạn quy định trước
    currentCount: 48       // Số lượng đã đăng ký thực tế (lấy từ database/file)
};

/**
 * Chức năng kiểm tra và xử lý đăng ký ngầm
 * @param {Object} userData - Thông tin người đăng ký
 * @returns {Object} Kết quả xử lý bao gồm trạng thái và dữ liệu (QR hoặc thông báo)
 */
function processEventRegistration(userData) {
    // 1. Kiểm tra giới hạn số lượng
    if (EVENT_CONFIG.currentCount >= EVENT_CONFIG.MAX_SLOTS) {
        return {
            success: false,
            message: "Đã đủ số lượng đăng ký tham gia sự kiện",
            qrCode: null // Ngừng cung cấp mã QR
        };
    }

    // 2. Logic xử lý khi còn chỗ
    // Giả lập lưu vào cơ sở dữ liệu
    EVENT_CONFIG.currentCount++; 
    
    // Tạo dữ liệu mã QR (Ví dụ: tạo chuỗi mã hóa từ ID người dùng)
    const qrData = `EVENT2026_${userData.id}_${Date.now()}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    return {
        success: true,
        message: "Đăng ký thành công!",
        qrCode: qrCodeUrl
    };
}

// --- Ví dụ cách sử dụng trong project của bạn ---

const newUser = { id: "USER123", name: "Nguyen Van A" };
const result = processEventRegistration(newUser);

if (result.success) {
    console.log(result.message);
    console.log("Mã QR của bạn:", result.qrCode);
} else {
    console.warn(result.message); // Thông báo: Đã đủ số lượng...
    // Lúc này result.qrCode là null, hệ thống sẽ không hiển thị gì thêm
}