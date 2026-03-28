let danhSach = [];
let editIndex = -1;
const STORAGE_KEY = 'DANH_SACH_SU_KIEN_APP';

// --- CƠ CHẾ LƯU TRỮ ---

// 1. Lưu mảng danhSach vào localStorage
function luuVaoBoNho() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(danhSach));
}

// 2. Tải dữ liệu từ localStorage khi mở trang
function taiDuLieu() {
    const dataRaw = localStorage.getItem(STORAGE_KEY);
    if (dataRaw) {
        danhSach = JSON.parse(dataRaw);
        hienThiDanhSach(danhSach);
    }
}

// Tự động gọi hàm tải dữ liệu ngay khi trang web được nạp xong
window.onload = taiDuLieu;

// --- CÁC HÀM XỬ LÝ NGHIỆP VỤ ---

function themThanhVien() {
    const values = {
        hoTen: document.getElementById('hoTen').value.trim(),
        mssv: document.getElementById('mssv').value.trim(),
        email: document.getElementById('email').value.trim(),
        sdt: document.getElementById('sdt').value.trim(),
        trangThai: document.getElementById('trangThai').value
    };

    if (!values.hoTen || !values.mssv) {
        alert("Vui lòng nhập Họ tên và MSSV!");
        return;
    }

    if (editIndex === -1) {
        danhSach.push(values);
    } else {
        danhSach[editIndex] = values;
        editIndex = -1;
        document.querySelector('.btn-add').innerText = "Thêm / Cập Nhật";
    }

    luuVaoBoNho(); // Lưu lại sau khi thêm/sửa
    clearForm();
    filterData();
}

function xoaThanhVien(index) {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
        danhSach.splice(index, 1);
        luuVaoBoNho(); // Lưu lại sau khi xóa
        filterData();
    }
}

function hienThiDanhSach(data) {
    const tableBody = document.getElementById('tableBody');
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Trống</td></tr>`;
        return;
    }

    tableBody.innerHTML = data.map((item, index) => {
        const statusClass = (item.trangThai === 'Đã Check-in') ? 'status-checkin' : 'status-not';
        // Tìm index thực sự trong mảng gốc để đảm bảo Sửa/Xóa đúng người khi đang filter
        const realIdx = danhSach.findIndex(d => d.mssv === item.mssv);
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${item.hoTen}</td>
                <td>${item.mssv}</td>
                <td>${item.email}</td>
                <td>${item.sdt}</td>
                <td><span class="${statusClass}">${item.trangThai}</span></td>
                <td>
                    <button class="btn-edit" onclick="chuanBiSua(${realIdx})">Sửa</button>
                    <button class="btn-delete" onclick="xoaThanhVien(${realIdx})">Xóa</button>
                </td>
            </tr>`;
    }).join('');
}

function filterData() {
    const key = document.getElementById('searchKey').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;
    const ketQua = danhSach.filter(item => {
        const matchKey = item.hoTen.toLowerCase().includes(key) || item.mssv.toLowerCase().includes(key);
        const matchStatus = (status === "All") || (item.trangThai === status);
        return matchKey && matchStatus;
    });
    hienThiDanhSach(ketQua);
}

function chuanBiSua(index) {
    const item = danhSach[index];
    document.getElementById('hoTen').value = item.hoTen;
    document.getElementById('mssv').value = item.mssv;
    document.getElementById('email').value = item.email;
    document.getElementById('sdt').value = item.sdt;
    document.getElementById('trangThai').value = item.trangThai;
    editIndex = index;
    document.querySelector('.btn-add').innerText = "Lưu Thay Đổi";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function xuatFile() {
    if (danhSach.length === 0) return alert("Không có dữ liệu!");
    const BOM = '\uFEFF';
    let csv = BOM + "STT,Họ Tên,MSSV,Email,SĐT,Trạng Thái\n";
    danhSach.forEach((item, i) => {
        csv += `${i+1},"${item.hoTen}","${item.mssv}","${item.email}","${item.sdt}","${item.trangThai}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "danh_sach.csv";
    link.click();
}

function clearForm() {
    ['hoTen', 'mssv', 'email', 'sdt'].forEach(id => document.getElementById(id).value = "");
}