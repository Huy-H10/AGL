function genTicketId() {
  return "TICKET-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

// ── Lấy thông tin sự kiện theo tên ───────────────────────
function getEventByName(name) {
  const events = JSON.parse(localStorage.getItem("events") || "[]");
  return events.find(e => e.t === name) || null;
}

// ── Lưu vé vào localStorage ──────────────────────────────
function saveTicket(ticket) {
  const tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
  tickets.push(ticket);
  localStorage.setItem("tickets", JSON.stringify(tickets));
}

// ── Hiển thị modal QR ────────────────────────────────────
function showQRModal(ticket) {
  // Dữ liệu encode vào QR
  const qrData = JSON.stringify({
    ticketId : ticket.ticketId,
    name     : ticket.name,
    event    : ticket.event,
    date     : ticket.date,
    time     : ticket.time,
    location : ticket.location
  });

  const modal = document.getElementById("qrModal");
  const qrBox  = document.getElementById("qrCodeBox");

  // Xóa QR cũ
  qrBox.innerHTML = "";

  // Điền thông tin vé
  document.getElementById("qr_ticketId").textContent = ticket.ticketId;
  document.getElementById("qr_name").textContent     = ticket.name;
  document.getElementById("qr_event").textContent    = ticket.event;
  document.getElementById("qr_date").textContent     = ticket.date  || "—";
  document.getElementById("qr_time").textContent     = ticket.time  || "—";
  document.getElementById("qr_location").textContent = ticket.location || "—";

  // Tạo QR code bằng thư viện QRCode.js
  new QRCode(qrBox, {
    text       : qrData,
    width      : 200,
    height     : 200,
    colorDark  : "#e84393",
    colorLight : "#fff9fb",
    correctLevel: QRCode.CorrectLevel.H
  });

  modal.style.display = "flex";

  // Lưu ticketId vào nút download để dùng sau
  document.getElementById("btnDownloadQR").dataset.ticketId = ticket.ticketId;
}

// ── Tải xuống QR dạng PNG ────────────────────────────────
function downloadQR() {
  const canvas = document.querySelector("#qrCodeBox canvas");
  if (!canvas) return;

  const link = document.createElement("a");
  const ticketId = document.getElementById("btnDownloadQR").dataset.ticketId || "ve";
  link.download = "ve-" + ticketId + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ── Đóng modal QR ─────────────────────────────────────────
function closeQRModal() {
  document.getElementById("qrModal").style.display = "none";
}

// ── Xem lại vé đã đăng ký ────────────────────────────────
function xemLaiVe(ticketId) {
  const tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
  const ticket  = tickets.find(t => t.ticketId === ticketId);
  if (ticket) showQRModal(ticket);
}

// ── ĐĂNG KÝ THAM GIA (ghi đè addParticipant) ─────────────
function addParticipant() {
  // Kiểm tra đăng nhập
  const cu = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!cu) {
    if (typeof showToast === "function") showToast("🔒 Vui lòng đăng nhập trước!", "error");
    if (typeof go === "function") go("login");
    return;
  }

  const pname  = document.getElementById("pname")?.value.trim();
  const pevent = document.getElementById("peventSelect")?.value;

  if (!pname || !pevent) {
    if (typeof showToast === "function") showToast("❌ Vui lòng điền đầy đủ thông tin!", "error");
    return;
  }

  // Kiểm tra đã đăng ký sự kiện này chưa
  const tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
  const existed = tickets.find(t => t.name === pname && t.event === pevent);
  if (existed) {
    if (typeof showToast === "function") showToast("⚠️ Bạn đã đăng ký sự kiện này rồi!", "error");
    // Hiển thị lại vé cũ
    showQRModal(existed);
    return;
  }

  // Lấy thông tin sự kiện
  const eventInfo = getEventByName(pevent);

  // Tạo vé mới
  const ticket = {
    ticketId  : genTicketId(),
    name      : pname,
    event     : pevent,
    date      : eventInfo?.d        || "",
    time      : eventInfo?.timeStart || eventInfo?.time || "",
    location  : eventInfo?.location  || "",
    registeredAt: new Date().toISOString()
  };

  // Lưu vé
  saveTicket(ticket);

  // Lưu vào participants (tương thích các module khác)
  const participants = JSON.parse(localStorage.getItem("participants") || "[]");
  participants.push({ name: pname, event: pevent, ticketId: ticket.ticketId });
  localStorage.setItem("participants", JSON.stringify(participants));

  // Reset form
  document.getElementById("pname").value = "";

  // Re-render nếu có
  if (typeof renderParticipants === "function") renderParticipants();

  // Hiển thị QR
  showQRModal(ticket);
}

// ── INJECT MODAL QR VÀO DOM ───────────────────────────────
function injectQRModal() {
  if (document.getElementById("qrModal")) return;

  // Load thư viện QRCode.js từ CDN
  if (!document.getElementById("qrcodeScript")) {
    const script = document.createElement("script");
    script.id  = "qrcodeScript";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    document.head.appendChild(script);
  }

  document.body.insertAdjacentHTML("beforeend", `
  <div id="qrModal" style="
    display:none; position:fixed; top:0; left:0;
    width:100%; height:100%; background:rgba(0,0,0,0.55);
    z-index:99999; justify-content:center; align-items:center;">

    <div style="
      background:#fff; border-radius:24px; padding:32px 28px;
      width:90%; max-width:420px; text-align:center;
      box-shadow:0 20px 60px rgba(255,105,180,.35);
      animation: slideUp .4s ease both;">

      <!-- Header -->
      <div style="
        width:56px; height:56px; border-radius:50%;
        background:linear-gradient(135deg,#ff6a88,#ffb6c1);
        display:flex; align-items:center; justify-content:center;
        font-size:26px; margin:0 auto 12px;">🎟️</div>

      <h2 style="color:#e84393; font-family:'Quicksand',sans-serif; margin-bottom:4px;">
        Vé của bạn
      </h2>
      <p style="color:#aaa; font-size:13px; margin-bottom:20px;">
        Xuất trình mã QR này khi check-in sự kiện
      </p>

      <!-- QR Code -->
      <div id="qrCodeBox" style="
        display:inline-block; padding:12px;
        background:#fff9fb; border-radius:16px;
        border:2px solid #ffe0ea; margin-bottom:16px;">
      </div>

      <!-- Thông tin vé -->
      <div style="
        background:#fff0f5; border-radius:14px;
        padding:14px 16px; text-align:left; margin-bottom:18px;
        font-size:13px; color:#555; line-height:2;">
        <div>🎫 <strong>Mã vé:</strong> <span id="qr_ticketId" style="color:#e84393; font-weight:700;"></span></div>
        <div>👤 <strong>Họ tên:</strong> <span id="qr_name"></span></div>
        <div>📅 <strong>Sự kiện:</strong> <span id="qr_event"></span></div>
        <div>🗓️ <strong>Ngày:</strong> <span id="qr_date"></span></div>
        <div>⏰ <strong>Giờ:</strong> <span id="qr_time"></span></div>
        <div>📍 <strong>Địa điểm:</strong> <span id="qr_location"></span></div>
      </div>

      <!-- Buttons -->
      <div style="display:flex; gap:10px;">
        <button id="btnDownloadQR" onclick="downloadQR()" style="
          flex:2; padding:12px; border:none; border-radius:14px;
          background:linear-gradient(135deg,#ff6a88,#e84393);
          color:#fff; font-weight:700; cursor:pointer; font-size:14px;">
          📥 Tải vé về máy
        </button>
        <button onclick="closeQRModal()" style="
          flex:1; padding:12px; border:2px solid #ffc0d0;
          background:#fff; color:#e84393; border-radius:14px;
          font-weight:700; cursor:pointer; font-size:14px;">
          Đóng
        </button>
      </div>

    </div>
  </div>

  <style>
    @keyframes slideUp {
      from { opacity:0; transform:translateY(30px); }
      to   { opacity:1; transform:translateY(0); }
    }
  </style>`);
}

// ── CẬP NHẬT TRANG JOIN: hiện danh sách vé đã đăng ký ───
function renderMyTickets() {
  const cu = JSON.parse(localStorage.getItem("currentUser") || "null");
  const container = document.getElementById("myTickets");
  if (!container) return;

  if (!cu) { container.innerHTML = ""; return; }

  const tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
  const mine    = tickets.filter(t => t.name === cu.name);

  if (mine.length === 0) {
    container.innerHTML = `<p style="color:#aaa; text-align:center; margin-top:12px;">Bạn chưa đăng ký sự kiện nào.</p>`;
    return;
  }

  container.innerHTML = `
    <h3 style="color:#e84393; margin:16px 0 8px; font-size:15px;">🎟️ Vé của bạn</h3>
    ${mine.map(t => `
      <div style="
        background:#fff0f5; border-radius:12px; padding:12px 14px;
        margin-bottom:8px; display:flex; justify-content:space-between;
        align-items:center; font-size:13px;">
        <div>
          <div style="font-weight:700; color:#333;">${t.event}</div>
          <div style="color:#aaa;">${t.date || ""} ${t.time ? "• " + t.time : ""}</div>
          <div style="color:#ff6a88; font-size:11px;">${t.ticketId}</div>
        </div>
        <button onclick="xemLaiVe('${t.ticketId}')" style="
          padding:7px 12px; background:#ff6a88; color:#fff;
          border:none; border-radius:10px; cursor:pointer;
          font-size:12px; font-weight:700;">
          🔍 Xem vé
        </button>
      </div>
    `).join("")}`;
}

// ── KHỞI CHẠY ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  injectQRModal();

  // Hook vào hàm go() để render myTickets khi vào trang join
  const _origGo = window.go;
  window.go = function(id) {
    _origGo(id);
    if (id === "join") {
      updateEventDropdown();
      renderMyTickets();
    }
  };
});
