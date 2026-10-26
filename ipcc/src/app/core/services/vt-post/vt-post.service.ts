import { Injectable } from "@angular/core";
import { AbstractService } from "@core/services/abstract.service";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "@core/services/auth/auth.service";
import { ToastService } from "@core/services/toast-service";
import { Observable, of } from "rxjs";
import { SERVICES } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { ResponseEnvelope } from "@core/models/response.model";
import { IBill } from "@models/vt-post/vt-post.model";
import {map} from "rxjs/operators";
export function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key: string) => {

      const camelKey = key
          .toLowerCase()
          .replace(/_([a-z])/g, (_, c) => c.toUpperCase());

      result[camelKey] = convertKeysToCamelCase(obj[key]);

      return result;
    }, {});
  }
  return obj;
}
@Injectable({ providedIn: 'root' })
export class VTPostService extends AbstractService {
  constructor(private http: HttpClient,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private translate: TranslateService) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1`;
  }

  //IBill[]
  public getInfoBill(code: string): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/chi-tiet-don-hang?maVanDon=${code}`);
  }

  // Hành trình đơn hàng
  public getJourneysBill(code: string): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/hanh-trinh-don-hang-e2?maVanDon=${code}`)
        .pipe(
        map((res: any) => ({
          ...res,
          data: convertKeysToCamelCase(res.data)
        }))
    );
    // return this.http.get(`${this.SERVICE_URL}/vtp/hanh-trinh-buu-gui?maVanDon=${code}`);
  }

  // lấy danh sách lịch sử khiếu nại
  public getComplaintHistory(code: string, size: number = 10, page: number = 1, sort: string = 'maVanDon,DESC'): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/lich-su-khieu-nai-don-hang?maVanDon=${code}&size=${size}&page=${page}&sort=${sort}`);
  }

  public getHistoryPostOfficeImpact(code: string): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/lich-su-tac-dong-khieu-nai?maKhieuNai=${code}`);
  }

  // lấy thông tin chi tiết khiếu nại đơn hàng
  public getInfoCustomerComplaint(code: string): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/chi-tiet-khieu-nai-don-hang?maKhieuNai=${code}`);
  }

  // danh sách bưu cục xử lý
  public getListPostOffice(keyword: string = ' '): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/danh-sach-buu-cuc`, {params: {keyWord: keyword}});
  }

  // tạo đơn khiếu nại
  public createComplaint(formData: FormData): Observable<any> {
    return this.http.post(`${this.SERVICE_URL}/vtp/create`, formData);
  }

  // sửa đơn khiếu nại
  public updateComplaint(body: any): Observable<any> {
    return this.http.post(`${this.SERVICE_URL}/vtp/cap-nhat-don-khieu-nai`, body);
  }

  // danh sách phân loại phản ánh
  public getListPLPhanAnh(page: number = 1, size: number = 9999): Observable<any> {
    return this.http.post(`${this.SERVICE_URL}/vtp/danh-sach-phan-loai`, { "page": page, "size": size, "trangThai": [1], "type": "2" }
    );
  }

  // lấy ds lịch sử khiếu nại khách hàng (tab thông tin chung)
  public getListComplaint(body: {
    "keySearch": string,
    "fromDate": string,
    "toDate": string,
    "page": number,
    "size": number
  }): Observable<any> {
    return this.http.post(`${this.SERVICE_URL}/vtp/lich-su-khieu-nai-khach-hang`, body);
  }

  // lấy ds lịch sử cuoc goi (tab thông tin chung)
  public getListHistoryCall(queryParam: {
    "soDienThoai": string,
    "startTime": number,
    "endTime": number,
    "page": number,
    "size": number,
    sort: string,
  }): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/lich-su-cuoc-goi`, {params: queryParam});
  }

  // danh sách kênh phản ánh
  public getListComplaintChannel(): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/danh-sach-kenh-tiep-nhan`);
  }

  // danh sách mức độ khiếu nại
  public getLevel(): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/danh-sach-muc-do-khieu-nai`);
  }

  // danh sách cá nhân xử lý
  public getCaNhanXuLyTheoBC(postcode: string): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/danh-sach-nhan-vien-theo-buu-cuc`, {params: {postcode: postcode}});
  }

  // lấy thông tin thêm để map với các key required khi tạo đơn kn
  public getChiTietDonHang(maVanDon: string): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/chi-tiet-ma-van-don`, {params: {maVanDon: maVanDon}});
  }

  // lấy danh sách kênh hiển thị vt post
  public getListKenhHienThiVTPost(): Observable<any> {
    return this.http.get(`${this.SERVICE_URL}/vtp/danh-sach-kenh-hien-thi`);
  }
}

export const lich_su_khieu_nai_don_hang = {
  "status": "success",
  "timestamp": 1768021711567,
  "timestampISO8601": "2026-01-10T12:08:31+0700",
  "data": {
    "status": 200,
    "error": false,
    "message": "Thành Công",
    "data": {
      "totalCount": 3,
      "data": [
        {
          "maVanDon": "302526054960",
          "maKhieuNai": "KN_CUS_09_12_PCSKH_14451383",
          "ngayKhieuNai": "09-12-2025 14:51:55",
          "phanLoai": "KHIEU_NAI",
          "noiDung": "vvvddddd",
          "bcXuLy": "TN2",
          "mucDo": "2",
          "trangThai": "DA_HOANTHANH",
          "hanXuly": "09-12-2025 16:51:55",
          "logs": [
            {
              "thoigian": "09-12-2025 14:51:55",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "Đã tạo mới ticket",
              "donviTacdong": "TN2",
              "nguoiTacdong": "trongbd05 test 1 - 0964058932",
              "tacdong": "Tạo Mới",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "09-12-2025 14:53:49",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "vvvddddd",
              "donviTacdong": "TN2",
              "nguoiTacdong": "admin_vtp - null",
              "tacdong": "Ghi nhận nội dung",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 14:08:37",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "vvvddddd",
              "donviTacdong": "TN2",
              "nguoiTacdong": "admin_vtp - null",
              "tacdong": "Tăng Cấp Độ",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:16:22",
              "trangthai": "DA_HOANTHANH",
              "noidung": "302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Hoàn thành Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            }
          ],
          "loiCap3": null,
          "chuyenQuan": null,
          "traLoiKH": null,
          "ngayTao": "09-12-2025 14:51:55",
          "ngayCapNhat": null,
          "userCreated": null,
          "type": "KHIEUNAI",
          "maPhanAnh": "G123",
          "tenPhanAnh": "Giang test phân loại phản ánh1"
        },
        {
          "maVanDon": "302526054960",
          "maKhieuNai": "KN_PCSKH_10_12_PCSKH_14451404",
          "ngayKhieuNai": "10-12-2025 16:16:44",
          "phanLoai": "KHIEU_NAI",
          "noiDung": "302526054960 302526054960 302526054960 302526054960 302526054960 302526054960 302526054960 302526054960",
          "bcXuLy": "TN2",
          "mucDo": "1",
          "trangThai": "DA_HOANTHANH",
          "hanXuly": "12-12-2025 09:00:00",
          "logs": [
            {
              "thoigian": "10-12-2025 16:16:44",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "Đã tạo mới ticket",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Tạo Mới",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:17:05",
              "trangthai": "DA_PHAN_CONG",
              "noidung": "302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:17:13",
              "trangthai": "DANG_XU_LY",
              "noidung": "Đã tiếp nhận ticket",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Tiếp nhận",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:20:23",
              "trangthai": "DA_XU_LY",
              "noidung": "302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:20:17",
              "trangthai": "DANG_XU_LY",
              "noidung": "302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:20:57",
              "trangthai": "DANG_XU_LY",
              "noidung": "302526054960 302526054960 302526054960 302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:20:44",
              "trangthai": "DA_XU_LY",
              "noidung": "302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:20:02",
              "trangthai": "DANG_XU_LY",
              "noidung": "302526054960302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:21:17",
              "trangthai": "DA_XU_LY",
              "noidung": "302526054960 302526054960 302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:21:35",
              "trangthai": "DA_HOANTHANH",
              "noidung": "302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Hoàn thành Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:20:31",
              "trangthai": "DANG_XU_LY",
              "noidung": "302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:21:00",
              "trangthai": "DA_XU_LY",
              "noidung": "302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "10-12-2025 16:21:25",
              "trangthai": "DANG_XU_LY",
              "noidung": "302526054960 302526054960",
              "donviTacdong": "TTVH",
              "nguoiTacdong": "vinhnh8 - 84328899299",
              "tacdong": "Cập nhật Xử Lý",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            }
          ],
          "loiCap3": null,
          "chuyenQuan": null,
          "traLoiKH": null,
          "ngayTao": "10-12-2025 16:16:44",
          "ngayCapNhat": null,
          "userCreated": null,
          "type": "KHIEUNAI",
          "maPhanAnh": "PL0222",
          "tenPhanAnh": "Khiếu nại về việc thanh toán chậm muộn, sai cước "
        },
        {
          "maVanDon": "302526054960",
          "maKhieuNai": "KN_CUS_11_12_PCSKH_14451418",
          "ngayKhieuNai": "11-12-2025 17:02:26",
          "phanLoai": "KHIEU_NAI",
          "noiDung": "vvvddddd",
          "bcXuLy": "PCSKH",
          "mucDo": "2",
          "trangThai": "CHO_TIEP_NHAN",
          "hanXuly": "12-12-2025 09:00:00",
          "logs": [
            {
              "thoigian": "05-01-2026 14:15:01",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "vvvddddd",
              "donviTacdong": "TN2",
              "nguoiTacdong": "admin_vtp - null",
              "tacdong": "Tăng Cấp Độ",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "05-01-2026 14:16:26",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "vvvddddd",
              "donviTacdong": "TN2",
              "nguoiTacdong": "admin_vtp - null",
              "tacdong": "Ghi nhận nội dung",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "11-12-2025 17:02:26",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "Đã tạo mới ticket",
              "donviTacdong": "TN2",
              "nguoiTacdong": "trongbd05 test 1 - 0964058932",
              "tacdong": "Tạo Mới",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "11-12-2025 17:03:03",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "vvvddddd",
              "donviTacdong": "TN2",
              "nguoiTacdong": "admin_vtp - null",
              "tacdong": "Ghi nhận nội dung",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            },
            {
              "thoigian": "11-12-2025 17:04:05",
              "trangthai": "CHO_TIEP_NHAN",
              "noidung": "vvvddddd",
              "donviTacdong": "TN2",
              "nguoiTacdong": "admin_vtp - null",
              "tacdong": "Ghi nhận nội dung",
              "phone": null,
              "buuCucXuLy": null,
              "phanLoaiPhanAnh": null,
              "lyDoGiaHan": null,
              "thoiGianGiaHan": null,
              "traLoiKhachhang": null,
              "caNhanXuLy": null,
              "danhsachFile": []
            }
          ],
          "loiCap3": null,
          "chuyenQuan": null,
          "traLoiKH": null,
          "ngayTao": "11-12-2025 17:02:26",
          "ngayCapNhat": null,
          "userCreated": null,
          "type": "KHIEUNAI",
          "maPhanAnh": "G123",
          "tenPhanAnh": "Giang test phân loại phản ánh1"
        }
      ],
      "paging": {
        "first": "/api/tcht/lich-su-khieu-nai-don-hang?page=1&size=10",
        "previous": null,
        "next": null,
        "last": "/api/tcht/lich-su-khieu-nai-don-hang?page=1&size=10"
      }
    }
  }
}

export const hanh_trinh_don_hang = {
  "status": "success",
  "timestamp": 1768023348405,
  "timestampISO8601": "2026-01-10T12:35:48+0700",
  "data": {
    "status": 200,
    "error": false,
    "message": "Thành công",
    "data": [
      {
        "maVD": "302571350275",
        "loai": 0,
        "nguoiNhapMay": "Hệ thống",
        "maBuuCuc": "PNVDT",
        "tinh": "Hà Nội",
        "maBuuCucDen": "PNVDT",
        "nhanVienPhat": null,
        "trangThai": 103,
        "noiDung": "Phân công bưu cục nhận hàng",
        "ghiChu": "Giao cho bưu cục",
        "bienSoXe": null,
        "thoiGian": "26/12/2025 14:32:39",
        "thoiGianXeChay": null,
        "tmp": "2025-12-26 14:32:39.0",
        "uuTien": "0"
      },
      {
        "maVD": "302571350275",
        "loai": 0,
        "nguoiNhapMay": "Hệ thống",
        "maBuuCuc": "PNVDT",
        "tinh": "Hà Nội",
        "maBuuCucDen": "PNVDT",
        "nhanVienPhat": null,
        "trangThai": 103,
        "noiDung": "Phân công bưu cục nhận hàng",
        "ghiChu": "Giao cho bưu cục",
        "bienSoXe": null,
        "thoiGian": "26/12/2025 14:32:36",
        "thoiGianXeChay": null,
        "tmp": "2025-12-26 14:32:36.0",
        "uuTien": "0"
      },
      {
        "maVD": "302571350275",
        "loai": 1,
        "nguoiNhapMay": null,
        "maBuuCuc": null,
        "tinh": null,
        "maBuuCucDen": null,
        "nhanVienPhat": null,
        "trangThai": 100,
        "noiDung": "Khách hàng tạo đơn(Dv: MIN; Dvgt: PXD,GKN; Trọng lượng: 1,200gr; Thu hộ: 0VNĐ)",
        "ghiChu": "Khách hàng tạo đơn",
        "bienSoXe": null,
        "thoiGian": "26/12/2025 14:32:33",
        "thoiGianXeChay": null,
        "tmp": "2025-12-26 14:32:33.0",
        "uuTien": "0"
      }
    ]
  }
}

export const buu_cuc_xu_ly = {
  "status": "success",
  "timestamp": 1768022666851,
  "timestampISO8601": "2026-01-10T12:24:26+0700",
  "data": {
    "status": 200,
    "error": false,
    "message": "Thành công",
    "data": [
      {
        "tenBuuCuc": "Thử nghiệm 1",
        "maBuuCuc": "TN2",
        "machinhanh": "TCT",
        "maChiNhanhMoi": null,
        "tenChiNhanh": "Tổng Công Ty Bưu Chính Viettel"
      }
    ]
  }
}

export const kenh_phan_anh = {
  "status": "success",
  "timestamp": 1768022058584,
  "timestampISO8601": "2026-01-10T12:14:18+0700",
  "data": {
    "status": 200,
    "error": false,
    "message": "Thành công",
    "data": [
      {
        "key": "social",
        "value": "Mạng xã hội"
      },
      {
        "key": "web",
        "value": "Website"
      },
      {
        "key": "app",
        "value": "Web/app khách hàng"
      },
      {
        "key": "callcenter",
        "value": "Tổng đài 19008095"
      },
      {
        "key": "mail",
        "value": "Mail"
      },
      {
        "key": "BOT",
        "value": "BOT"
      },
      {
        "key": "DonVi",
        "value": "Đơn vị"
      },
      {
        "key": "OKD",
        "value": "Chat app"
      },
      {
        "key": "QTE",
        "value": "Quốc tế"
      }
    ]
  }
}

export const muc_do = {
  "status": "success",
  "timestamp": 1768022403993,
  "timestampISO8601": "2026-01-10T12:20:03+0700",
  "data": {
    "status": 200,
    "error": false,
    "message": "Thành công",
    "data": [
      {
        "key": "1",
        "value": "Bình thường"
      },
      {
        "key": "2",
        "value": "Hot"
      },
      {
        "key": "3",
        "value": "Hẹn giờ/Hồ sơ thầu"
      },
      {
        "key": "4",
        "value": "KH đặc thù"
      }
    ]
  }
}

export const ca_nhan_xu_ly = {
  "status": "success",
  "timestamp": 1768022878905,
  "timestampISO8601": "2026-01-10T12:27:58+0700",
  "data": {
    "status": 200,
    "error": false,
    "message": "Thành công",
    "data": [
      {
        "userId": "2119272",
        "employeeCode": "458017",
        "userName": "thuyht12",
        "fullName": "Hoàng Thị Thủy",
        "phoneNumber": "",
        "bcXuLyMoi": null
      },
      {
        "userId": "1223539",
        "employeeCode": "440093",
        "userName": "thuyht7",
        "fullName": "Hoàng Thủy",
        "phoneNumber": "",
        "bcXuLyMoi": null
      }
    ]
  }
}

export const phan_loai_phan_anh =
{
  "status": "success",
  "timestamp": 1768022878905,
  "timestampISO8601": "2026-01-10T12:27:58+0700",
  "data": {
    "status": 200,
    "error": false,
    "message": "Thành công",
    "data": {
      "totalCount": 3,
      "data": [
        {
          "id": 198,
          "ma": "H32",
          "ten": "phân loại phản ánh cấp 2",
          "xulyThuong": 3,
          "xulyDacthu": 3,
          "buucucXuly": "BCHT",
          "trangThai": 1,
          "cap1": "maloic12",
          "chucDanhList": [
            "CD 01"
          ],
          "tichHopList": [
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
          ],
          "maNguyenNhanLoiList": [
            "tesst"
          ]
        },
        {
          "id": 195,
          "ma": "G123",
          "ten": "Giang test phân loại phản ánh1",
          "xulyThuong": 2,
          "xulyDacthu": 2,
          "buucucXuly": "BCHT",
          "trangThai": 1,
          "cap1": "H1",
          "chucDanhList": [
            "TESST1111",
            "VTN0066",
            "VTN0067",
            "VTB0012",
            "VTN0069",
            "VTQ005",
            "MATEST",
            "VTQ003",
            "VTQ004",
            "VTB009",
            "VTB008",
            "VTB007",
            "VTB006",
            "VTB005",
            "VTB004",
            "VTB003",
            "VTB002",
            "VTB001",
            "VTC010",
            "VTN0060",
            "VTN0061",
            "VTT002",
            "VTN0062",
            "VTT001",
            "VTN0063",
            "VTN0064",
            "VTN060",
            "VTN0065",
            "ZXCZXCZXC",
            "VTN0078",
            "VTC009",
            "VTC008",
            "VTC007",
            "VTC006",
            "VTC004",
            "VTC003",
            "VTC002",
            "VTN01",
            "VTC001",
            "VTC0084",
            "VTC0083",
            "V_FULFILLMENT",
            "VTN0074",
            "VTN0049",
            "BC_NV",
            "VTC0082",
            "VTC0081",
            "DTG001",
            "VTN0081",
            "VTN004",
            "VTN0055",
            "VTN0099",
            "VTN005",
            "VTN0056",
            "VTN0057",
            "VTN006",
            "VTN0058",
            "VTN0059",
            "VTN001",
            "VTN002",
            "VTN003",
            "CN",
            "CD 01",
            "VTB014",
            "VTB013",
            "VTB012",
            "VTB011",
            "VTB010",
            "GDV001",
            "VTQ001",
            "VTQ002",
            "VTN0050",
            "V_TPKT_FULFILLMENT",
            "VTN0051",
            "VTN0052",
            "VTN0053",
            "VTN0054"
          ],
          "tichHopList": [
            1,
            2,
            3,
            4,
            5,
            7,
            8
          ],
          "maNguyenNhanLoiList": [
            "tesst",
            "T12",
            "S12",
            "1111",
            "L4",
            "maphananhmoi",
            "VTPTest1709",
            "0407",
            "N12",
            "N11"
          ]
        },
        {
          "id": 194,
          "ma": "H5CHILD",
          "ten": "H5CHILD",
          "xulyThuong": 2,
          "xulyDacthu": 2,
          "buucucXuly": "BCHT",
          "trangThai": 1,
          "cap1": "H5",
          "chucDanhList": [
            "TESST1111",
            "VTN0066",
            "VTN0067",
            "VTB0012",
            "VTN0069",
            "VTQ005",
            "MATEST",
            "VTQ003",
            "VTQ004",
            "VTB009",
            "VTB008",
            "VTB007",
            "VTB006",
            "VTB005",
            "VTB004",
            "VTB003",
            "VTB002",
            "VTB001",
            "VTC010",
            "VTN0060",
            "VTN0061",
            "VTT002",
            "VTN0062",
            "VTT001",
            "VTN0063",
            "VTN0064",
            "VTN060",
            "VTN0065",
            "ZXCZXCZXC",
            "VTN0078",
            "VTC009",
            "VTC008",
            "VTC007",
            "VTC006",
            "VTC004",
            "VTC003",
            "VTC002",
            "VTN01",
            "VTC001",
            "VTC0084",
            "VTC0083",
            "V_FULFILLMENT",
            "VTN0074",
            "VTN0049",
            "BC_NV",
            "VTC0082",
            "VTC0081",
            "DTG001",
            "VTN0081",
            "VTN004",
            "VTN0055",
            "VTN0099",
            "VTN005",
            "VTN0056",
            "VTN0057",
            "VTN006",
            "VTN0058",
            "VTN0059",
            "VTN001",
            "VTN002",
            "VTN003",
            "CN",
            "CD 01",
            "VTB014",
            "VTB013",
            "VTB012",
            "VTB011",
            "VTB010",
            "GDV001",
            "VTQ001",
            "VTQ002",
            "VTN0050",
            "V_TPKT_FULFILLMENT",
            "VTN0051",
            "VTN0052",
            "VTN0053",
            "VTN0054"
          ],
          "tichHopList": [
            1,
            4,
            10
          ],
          "maNguyenNhanLoiList": [
            "tesst",
            "T12",
            "S12",
            "1111",
            "L4",
            "maphananhmoi",
            "VTPTest1709",
            "0407",
            "N12",
            "N11"
          ]
        }
      ]
    }
  }
}
