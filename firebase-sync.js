import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update, set }
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1AjKDBaul5KmFQYdGOmQs0wPkcVVo9VI",
  authDomain: "agl-qlclb.firebaseapp.com",
  databaseURL: "https://agl-qlclb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agl-qlclb",
  storageBucket: "agl-qlclb.firebasestorage.app",
  messagingSenderId: "141206426649",
  appId: "1:141206426649:web:7fc9b098a48322b652c688"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── LOCAL CACHE ────────────────────────────────────────
let _events        = [];
let _participants   = [];
let _users         = [];
let _admins        = [];
let _assignments   = [];
let _notifications = [];
let _reviews       = [];
let _budgets       = [];

// ── READY PROMISE ──────────────────────────────────────
let _resolveReady;
const ready = new Promise(r => (_resolveReady = r));
const _REQUIRED_NODES = new Set(["events","participants","users","admins","assignments"]);
const _loadedNodes    = new Set();

function _checkReady(nodeName) {
  _loadedNodes.add(nodeName);
  if ([..._REQUIRED_NODES].every(n => _loadedNodes.has(n))) {
    _resolveReady();
  }
}

// ── DISPATCH helper: đảm bảo fire sau khi DOM sẵn sàng ─
function _dispatch(name, detail) {
  // Dùng setTimeout(0) để đảm bảo listeners đã được đăng ký
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }, 0);
}

// ── REALTIME LISTENERS ─────────────────────────────────
onValue(ref(db, "events"), snap => {
  _events = [];
  // Thêm { } để không return giá trị độ dài mảng
  snap.forEach(c => { _events.push({ id: c.key, ...c.val() }); }); 
  localStorage.setItem("events", JSON.stringify(_events));
  _dispatch("fs:events", _events);
  _checkReady("events");
});

onValue(ref(db, "participants"), snap => {
  _participants = [];
  snap.forEach(c => { _participants.push({ id: c.key, ...c.val() }); });
  localStorage.setItem("participants", JSON.stringify(_participants));
  _dispatch("fs:participants", _participants);
  _checkReady("participants");
});

onValue(ref(db, "users"), snap => {
  _users = [];
  snap.forEach(c => { _users.push({ id: c.key, role: "user", ...c.val() }); });
  _dispatch("fs:users", _users);
  _checkReady("users");
});

onValue(ref(db, "admins"), snap => {
  _admins = [];
  snap.forEach(c => { _admins.push({ id: c.key, role: "admin", ...c.val() }); });
  _dispatch("fs:admins", _admins);
  _checkReady("admins");
});

onValue(ref(db, "assignments"), snap => {
  _assignments = [];
  snap.forEach(c => { _assignments.push({ id: c.key, ...c.val() }); });
  localStorage.setItem("assignments", JSON.stringify(_assignments));
  _dispatch("fs:assignments", _assignments);
  _checkReady("assignments");
});

onValue(ref(db, "notifications"), snap => {
  _notifications = [];
  snap.forEach(c => { _notifications.push({ id: c.key, ...c.val() }); });
  localStorage.setItem("notifications", JSON.stringify(_notifications));
  _dispatch("fs:notifications", _notifications);
});

onValue(ref(db, "reviews"), snap => {
  _reviews = [];
  snap.forEach(c => { _reviews.push({ id: c.key, ...c.val() }); });
  _dispatch("fs:reviews", _reviews);
});

onValue(ref(db, "budgets"), snap => {
  _budgets = [];
  snap.forEach(c => { _budgets.push({ id: c.key, ...c.val() }); });
  localStorage.setItem("budgets", JSON.stringify(_budgets));
  _dispatch("fs:budgets", _budgets);
});

// ── TOAST HELPER ──────────────────────────────────────
function showToast(msg, type = "success") {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = [
      "position:fixed","bottom:25px","left:50%",
      "transform:translateX(-50%) translateY(100px)",
      "padding:12px 25px","border-radius:12px",
      "color:#fff","font-weight:700","transition:0.4s",
      "z-index:10001","opacity:0","pointer-events:none",
      "text-align:center","max-width:90vw"
    ].join(";");
    document.body.appendChild(t);
  }
  const colors = { success:"#2ecc71", error:"#e74c3c", info:"#3498db", warning:"#f39c12" };
  t.style.background = colors[type] || colors.success;
  t.textContent = msg;
  t.style.opacity   = "1";
  t.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity   = "0";
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
  getAdmins:        () => _admins,

  getAllAccounts: () => {
    const map = new Map();
    [..._users, ..._admins].forEach(u => {
      const key = (u.email || u.id || "").toLowerCase();
      if (!map.has(key)) {
        map.set(key, u);
      } else {
        if (u.passHash && !map.get(key).passHash) map.set(key, u);
      }
    });
    return [...map.values()];
  },

  getAssignments:   () => _assignments,
  getNotifications: () => _notifications,
  getReviews:       () => _reviews,
  getBudgets:       () => _budgets,

  getCurrentUser: () => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "null"); }
    catch { return null; }
  },
  isAdmin: () => {
    try {
      const u = JSON.parse(localStorage.getItem("currentUser") || "null");
      return u?.role === "admin";
    } catch { return false; }
  },
  isLoggedIn: () => {
    try { return !!JSON.parse(localStorage.getItem("currentUser") || "null"); }
    catch { return false; }
  },

  addEvent        : (d) => push(ref(db, "events"),        d),
  addParticipant  : (d) => push(ref(db, "participants"),  d),
  addAssignment   : (d) => push(ref(db, "assignments"),   d),
  addNotification : (d) => push(ref(db, "notifications"), d),
  addReview       : (d) => push(ref(db, "reviews"),       d),
  addBudget       : (d) => push(ref(db, "budgets"),       d),

  updateEvent       : (id, d) => update(ref(db, `events/${id}`),        d),
  updateParticipant : (id, d) => update(ref(db, `participants/${id}`),  d),
  updateAssignment  : (id, d) => update(ref(db, `assignments/${id}`),   d),
  updateBudget      : (id, d) => update(ref(db, `budgets/${id}`),       d),
  updateNotification: (id, d) => update(ref(db, `notifications/${id}`), d),

  deleteEvent       : (id) => remove(ref(db, `events/${id}`)),
  deleteParticipant : (id) => remove(ref(db, `participants/${id}`)),
  deleteAssignment  : (id) => remove(ref(db, `assignments/${id}`)),
  deleteNotification: (id) => remove(ref(db, `notifications/${id}`)),
  deleteBudget      : (id) => remove(ref(db, `budgets/${id}`)),
};

window.FS = FS;
export { FS, db, ref, push, update, remove, set, onValue, showToast };