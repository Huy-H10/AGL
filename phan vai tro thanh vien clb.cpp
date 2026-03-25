#include <bits/stdc++.h>
using namespace std;

// -----------------------------------
// Cau truc du lieu
// -----------------------------------
struct ThanhVien {
    string ten_dang_nhap;
    string ho_ten;
    int vai_tro;   // 1 = thanh vien, 2 = ban to chuc, 3 = admin
};

// -----------------------------------
// Bien toan cuc (de don gian)
// -----------------------------------
vector<ThanhVien> ds_thanh_vien;
string nguoi_hien_tai = "";
int vai_tro_hien_tai = 0;

// -----------------------------------
// Ham khoi tao du lieu mau
// -----------------------------------
void khoi_tao_du_lieu() {
    ds_thanh_vien.push_back({"admin",     "Tran Van Admin",   3});
    ds_thanh_vien.push_back({"tochuc1",   "Nguyen Thi To",    2});
    ds_thanh_vien.push_back({"thanhvien1","Le Van A",         1});
    ds_thanh_vien.push_back({"thanhvien2","Pham Thi B",       1});

    // Gia lap dang nhap
    nguoi_hien_tai = "admin";
    vai_tro_hien_tai = 3;
}

// -----------------------------------
// Ham tim thanh vien theo ten dang nhap
// tra ve chi so trong vector, -1 neu khong tim thay
// -----------------------------------
int tim_thanh_vien(string ten) {
    for (int i = 0; i < ds_thanh_vien.size(); i++) {
        if (ds_thanh_vien[i].ten_dang_nhap == ten) {
            return i;
        }
    }
    return -1;
}

// -----------------------------------
// Ham in danh sach thanh vien
// -----------------------------------
void in_danh_sach_thanh_vien() {
    cout << "\nDANH SACH THANH VIEN\n";
    cout << "------------------------\n";

    for (int i = 0; i < ds_thanh_vien.size(); i++) {
        string vt = (ds_thanh_vien[i].vai_tro == 1) ? "Thanh vien"
                  : (ds_thanh_vien[i].vai_tro == 2) ? "Ban to chuc"
                  : "ADMIN";

        cout << ds_thanh_vien[i].ten_dang_nhap << " - "
             << ds_thanh_vien[i].ho_ten << " - "
             << vt << "\n";
    }

    cout << "------------------------\n";
}

// -----------------------------------
// Ham hien thi menu chinh (theo vai tro)
// -----------------------------------
void hien_thi_menu() {
    cout << "\n=== MENU ===\n";
    cout << "Ban dang dang nhap: " << nguoi_hien_tai << "\n";

    if (vai_tro_hien_tai == 3) cout << "(ADMIN)\n";
    else if (vai_tro_hien_tai == 2) cout << "(Ban to chuc)\n";
    else cout << "(Thanh vien)\n";

    cout << "1. Xem danh sach thanh vien\n";

    if (vai_tro_hien_tai >= 2) {
        cout << "2. Tao su kien moi\n";
        cout << "3. Sua / Xoa su kien\n";
    }

    if (vai_tro_hien_tai == 3) {
        cout << "4. Doi vai tro thanh vien\n";
    }

    cout << "0. Thoat\n";
    cout << "Chon: ";
}

// -----------------------------------
// Ham xu ly chuc nang phan quyen (chi admin)
// -----------------------------------
void doi_vai_tro() {
    if (vai_tro_hien_tai != 3) {
        cout << "Chi ADMIN moi dung duoc chuc nang nay!\n";
        return;
    }

    string ten;
    cout << "Nhap ten dang nhap can doi: ";
    cin >> ten;

    int vi_tri = tim_thanh_vien(ten);
    if (vi_tri == -1) {
        cout << "Khong tim thay nguoi nay.\n";
        return;
    }

    if (ten == nguoi_hien_tai) {
        cout << "Khong the doi chinh minh!\n";
        return;
    }

    // Hien thong tin nguoi can doi
    cout << "\nNguoi: " << ds_thanh_vien[vi_tri].ho_ten << "\n";
    cout << "Vai tro hien tai: ";
    if (ds_thanh_vien[vi_tri].vai_tro == 1) cout << "Thanh vien\n";
    else if (ds_thanh_vien[vi_tri].vai_tro == 2) cout << "Ban to chuc\n";
    else cout << "ADMIN\n";

    // Chon vai tro moi
    cout << "\nChon vai tro moi (1=thanh vien, 2=ban to chuc, 3=admin): ";
    int vai_tro_moi;
    cin >> vai_tro_moi;

    if (vai_tro_moi < 1 || vai_tro_moi > 3) {
        cout << "Lua chon khong hop le!\n";
        return;
    }

    // Xac nhan
    cout << "Co chac muon doi khong? (y/n): ";
    string xac_nhan;
    cin >> xac_nhan;

    if (xac_nhan == "y" || xac_nhan == "Y") {
        int vai_tro_cu = ds_thanh_vien[vi_tri].vai_tro;
        ds_thanh_vien[vi_tri].vai_tro = vai_tro_moi;

        // Thong bao cho nguoi bi doi
        cout << "\n*** THONG BAO CHO " << ten << " ***\n";
        cout << "Vai tro cua ban da duoc thay doi!\n";
        cout << "Truoc: " << (vai_tro_cu==1?"Thanh vien":vai_tro_cu==2?"Ban to chuc":"ADMIN") << "\n";
        cout << "Sau  : " << (vai_tro_moi==1?"Thanh vien":vai_tro_moi==2?"Ban to chuc":"ADMIN") << "\n";
        cout << "Dang xuat roi dang nhap lai de cap nhat quyen.\n";
        cout << "************************************\n";

        cout << "Da doi thanh cong!\n";
    } else {
        cout << "Da huy thay doi.\n";
    }
}

// -----------------------------------
// Ham chinh
// -----------------------------------
int main() {
    khoi_tao_du_lieu();

    int lua_chon;

    do {
        hien_thi_menu();
        cin >> lua_chon;

        if (lua_chon == 1) {
            in_danh_sach_thanh_vien();
        }
        else if (lua_chon == 2 || lua_chon == 3) {
            if (vai_tro_hien_tai >= 2) {
                cout << "Chuc nang tao/sua su kien - dang mo phong\n";
            } else {
                cout << "Ban khong co quyen!\n";
            }
        }
        else if (lua_chon == 4) {
            doi_vai_tro();
        }
        else if (lua_chon == 0) {
            cout << "Tam biet!\n";
        }
        else {
            cout << "Lua chon khong hop le!\n";
        }

        cout << "\nNhan Enter de tiep tuc...\n";
        cin.ignore();
        cin.get();

    } while (lua_chon != 0);

    return 0;
}
