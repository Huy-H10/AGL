
// ── Trạng thái đang chọn ──────────────────────────────────
let selectedStatus = "Mở";

// ── Chọn trạng thái (click vào tag) ──────────────────────
function selectStatus(el) {
  document.querySelectorAll(".status-tag").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  selectedStatus = el.dataset.val;
}

// ── Đếm ký tự ─────────────────────────────────────────────
function initCharCounters() {
  const titleEl = document.getElementById("title");
  const descEl  = document.getElementById("desc");

  if (titleEl) {
    titleEl.addEventListener("input", function () {
      document.getElementById("titleCount").textContent = this.value.length + " / 100";
    });
  }
  if (descEl) {
    descEl.addEventListener("input", function () {
      document.getElementById("descCount").textContent = this.value.length + " / 300";
    });
  }
}

// ── Toast notification ────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast " + type + " show";
  setTimeout(() => t.classList.remove("show"), 3200);
}

// ── Xóa lỗi ──────────────────────────────────────────────
function clearErrors() {
  document.querySelectorAll(".err-msg").forEach(e => e.classList.remove("show"));
  document.querySelectorAll("input, textarea").forEach(e => e.classList.remove("error"));
}

function showError(fieldId, errId, msg) {
  const field = document.getElementById(fieldId);
  const err   = document.getElementById(errId);
  if (field) field.classList.add("error");
  if (err) {
    if (msg) err.textContent = msg;
    err.classList.add("show");
  }
}

// ── Tạo ID duy nhất ──────────────────────────────────────
function genId() {
  return "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

// ── SUBMIT: Tạo sự kiện ───────────────────────────────────
function submitEvent() {
  clearErrors();

  const title      = document.getElementById("title").value.trim();
  const leader     = document.getElementById("leader").value.trim();
  const date       = document.getElementById("date").value;
  const timeStart  = document.getElementById("timeStart").value;
  const timeEnd    = document.getElementById("timeEnd").value;
  const location   = document.getElementById("location").value.trim();
  const maxSlotRaw = document.getElementById("maxSlot").value;
  const desc       = document.getElementById("desc").value.trim();

  // ── Validate ──
  let valid = true;

  if (!title) {
    showError("title", "titleErr", "Vui lòng nhập tên sự kiện!");
    valid = false;
  }
  if (!leader) {
    showError("leader", "leaderErr", "Vui lòng nhập người phụ trách!");
    valid = false;
  }
  if (!date) {
    showError("date", "dateErr", "Vui lòng chọn ngày diễn ra!");
    valid = false;
  }
  if (!timeStart) {
    showError("timeStart", "timeStartErr", "Vui lòng chọn giờ bắt đầu!");
    valid = false;
  }
  if (timeEnd && timeStart && timeEnd <= timeStart) {
    showError("timeEnd", "timeEndErr", "Giờ kết thúc phải sau giờ bắt đầu!");
    valid = false;
  }
  if (maxSlotRaw && (isNaN(maxSlotRaw) || parseInt(maxSlotRaw) < 1)) {
    showError("maxSlot", "maxSlotErr", "Số lượng phải là số nguyên dương!");
    valid = false;
  }

  if (!valid) return;

  // ── Kiểm tra trùng tên + ngày ──
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const exists = events.some(
    e => e.t.toLowerCase() === title.toLowerCase() && e.d === date
  );
  if (exists) {
    showError("title", "titleErr", "Sự kiện này đã tồn tại trong ngày đó!");
    return;
  }

  // ── Lưu sự kiện mới ──
  const newEvent = {
    id       : genId(),
    t        : title,
    l        : leader,
    d        : date,
    timeStart: timeStart,
    timeEnd  : timeEnd  || "",
    location : location || "",
    maxSlot  : maxSlotRaw ? parseInt(maxSlotRaw) : null,
    status   : selectedStatus,
    desc     : desc || "",
    createdAt: new Date().toISOString()
  };

  events.push(newEvent);
  localStorage.setItem("events", JSON.stringify(events));

  // ── Thông báo thành công ──
  showToast("🎉 Tạo sự kiện \"" + title + "\" thành công!", "success");

  // ── Reset form ──
  setTimeout(() => resetForm(), 400);

  // ── Re-render danh sách nếu đang ở trang manage ──
  if (typeof renderEvents === "function") renderEvents();
}

// ── RESET form ────────────────────────────────────────────
function resetForm() {
  clearErrors();

  ["title", "leader", "location", "maxSlot", "desc"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const dateEl      = document.getElementById("date");
  const timeStartEl = document.getElementById("timeStart");
  const timeEndEl   = document.getElementById("timeEnd");
  if (dateEl)      dateEl.value      = "";
  if (timeStartEl) timeStartEl.value = "08:00";
  if (timeEndEl)   timeEndEl.value   = "";

  const titleCount = document.getElementById("titleCount");
  const descCount  = document.getElementById("descCount");
  if (titleCount) titleCount.textContent = "0 / 100";
  if (descCount)  descCount.textContent  = "0 / 300";

  // Reset status về "Mở"
  document.querySelectorAll(".status-tag").forEach(t => t.classList.remove("active"));
  const defaultTag = document.querySelector('.status-tag[data-val="Mở"]');
  if (defaultTag) defaultTag.classList.add("active");
  selectedStatus = "Mở";
}

// ── Khởi tạo ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initCharCounters();
});
