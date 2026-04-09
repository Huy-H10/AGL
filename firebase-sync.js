/**
 * firebase-sync.js
 * Module dùng chung để đồng bộ dữ liệu Firebase cho TẤT CẢ các trang.
 * Import bằng: <script type="module" src="firebase-sync.js"></script>
 *
 * Sau khi load, cung cấp window.FS với các method:
 *   FS.db, FS.ref, FS.push, FS.update, FS.remove, FS.onValue
 *   FS.getEvents(), FS.getParticipants(), FS.getUsers(), FS.getAssignments()
 *   FS.showToast(msg, type)
 *   FS.ready  — Promise resolve khi dữ liệu ban đầu đã load
 */

import { initializeApp }     from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update, set }
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// ── CONFIG (giống firebase.js) ─────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyD1AjKDBaul5KmFQYdGOmQs0wPkcVVo9VI",
  authDomain: "agl-qlclb.firebaseapp.com",
  databaseURL: "https://agl-qlclb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agl-qlclb",
  storageBucket: "agl-qlclb.firebasestorage.app",
  messagingSenderId: "141206426649",
  appId: "1:141206426649:web:7fc9b098a48322b652c688"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── LOCAL CACHE ────────────────────────────────────────
let _events       = [];
let _participants  = [];
let _users        = [];
let _assignments  = [];
let _notifications = [];
let _reviews      = [];

// ── READY PROMISE ──────────────────────────────────────
let _resolveReady;
const ready = new Promise(r => (_resolveReady = r));
let _loadCount = 0;
const TOTAL_NODES = 4; // events, participants, users, assignments

function _checkReady() {
  _loadCount++;
  if (_loadCount >= TOTAL_NODES) _resolveReady();
}

// ── REALTIME LISTENERS ─────────────────────────────────
onValue(ref(db, "events"), snap => {
  _events = [];
  snap.forEach(c => _events.push({ id: c.key, ...c.val() }));
  localStorage.setItem("events", JSON.stringify(_events));
  window.dispatchEvent(new CustomEvent("fs:events", { detail: _events }));
  _checkReady();
});

onValue(ref(db, "participants"), snap => {
  _participants = [];
  snap.forEach(c => _participants.push({ id: c.key, ...c.val() }));
  localStorage.setItem("participants", JSON.stringify(_participants));
  window.dispatchEvent(new CustomEvent("fs:participants", { detail: _participants }));
  _checkReady();
});

onValue(ref(db, "users"), snap => {
  _users = [];
  snap.forEach(c => _users.push({ id: c.key, ...c.val() }));
  window.dispatchEvent(new CustomEvent("fs:users", { detail: _users }));
  _checkReady();
});

onValue(ref(db, "assignments"), snap => {
  _assignments = [];
  snap.forEach(c => _assignments.push({ id: c.key, ...c.val() }));
  localStorage.setItem("assignments", JSON.stringify(_assignments));
  window.dispatchEvent(new CustomEvent("fs:assignments", { detail: _assignments }));
  _checkReady();
});

onValue(ref(db, "notifications"), snap => {
  _notifications = [];
  snap.forEach(c => _notifications.push({ id: c.key, ...c.val() }));
  localStorage.setItem("notifications", JSON.stringify(_notifications));
  window.dispatchEvent(new CustomEvent("fs:notifications", { detail: _notifications }));
});

onValue(ref(db, "reviews"), snap => {
  _reviews = [];
  snap.forEach(c => _reviews.push({ id: c.key, ...c.val() }));
  window.dispatchEvent(new CustomEvent("fs:reviews", { detail: _reviews }));
});

// ── TOAST HELPER ──────────────────────────────────────
function showToast(msg, type = "success") {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = `
      position:fixed;bottom:25px;left:50%;
      transform:translateX(-50%) translateY(100px);
      padding:12px 25px;border-radius:12px;
      color:#fff;font-weight:700;transition:0.4s;
      z-index:10001;opacity:0;pointer-events:none;`;
    document.body.appendChild(t);
  }
  const colors = { success:"#2ecc71", error:"#e74c3c", info:"#3498db", warning:"#f39c12" };
  t.style.background = colors[type] || colors.success;
  t.textContent = msg;
  t.style.opacity = "1";
  t.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-50%) translateY(100px)";
  }, 3000);
}

// ── PUBLIC API ────────────────────────────────────────
const FS = {
  db, ref, push, update, remove, set, onValue,
  ready,
  showToast,
  getEvents:        () => _events,
  getParticipants:  () => _participants,
  getUsers:         () => _users,
  getAssignments:   () => _assignments,
  getNotifications: () => _notifications,
  getReviews:       () => _reviews,
  getCurrentUser:   () => JSON.parse(localStorage.getItem("currentUser") || "null"),
  isAdmin:          () => { const u = JSON.parse(localStorage.getItem("currentUser")||"null"); return u?.role === "admin"; },

  // Shortcut ghi dữ liệu
  addEvent:        (data) => push(ref(db, "events"),       data),
  addParticipant:  (data) => push(ref(db, "participants"), data),
  addAssignment:   (data) => push(ref(db, "assignments"),  data),
  addNotification: (data) => push(ref(db, "notifications"),data),
  addReview:       (data) => push(ref(db, "reviews"),      data),

  updateEvent:       (id, data) => update(ref(db, `events/${id}`),       data),
  updateParticipant: (id, data) => update(ref(db, `participants/${id}`), data),
  updateAssignment:  (id, data) => update(ref(db, `assignments/${id}`),  data),

  deleteEvent:       (id) => remove(ref(db, `events/${id}`)),
  deleteParticipant: (id) => remove(ref(db, `participants/${id}`)),
  deleteAssignment:  (id) => remove(ref(db, `assignments/${id}`)),
  deleteNotification:(id) => remove(ref(db, `notifications/${id}`)),
};

window.FS = FS;
export { FS, db, ref, push, update, remove, set, onValue, showToast };
