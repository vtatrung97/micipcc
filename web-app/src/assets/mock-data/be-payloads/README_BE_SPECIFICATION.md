# TÀI LIỆU ĐẶC TẢ DỮ LIỆU JSON GỬI BACKEND (WORKFLOW STUDIO -> BE)

Tài liệu này hướng dẫn chi tiết cho đội ngũ Backend (BE) về cấu trúc JSON được sinh ra từ **Workflow Studio (Viettel Customer Service)** khi người dùng nhấn **"Lưu nháp"** hoặc **"Ban hành"** quy trình.

---

## 1. Cấu Trúc Tổng Thể Của Payload Gửi BE

Mỗi payload gửi lên BE là một đối tượng JSON chuẩn gồm **3 phần chính**:

```json
{
  "template": { ... },       // 1. Metadata thông tin chung của quy trình
  "executionGraph": { ... }, // 2. Đồ thị thực thi (Dành cho BE Engine duyệt bước & State Machine)
  "graphData": { ... }       // 3. Raw Canvas X6 (Dành cho FE render lại nguyên vẹn tọa độ & style)
}
```

---

## 2. Chi Tiết Các Phần Dữ Liệu

### 2.1. `template` (Thông tin chung quy trình)
| Trường | Kiểu | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- | :--- |
| `code` | `string` | Mã định danh duy nhất của quy trình (Unique Key) | `"PRC_BILLING_DISPUTE"` |
| `name` | `string` | Tên hiển thị của quy trình | `"Xử lý khiếu nại cước"` |
| `category` | `string` | Danh mục phân loại nghiệp vụ | `"Xử lý khiếu nại"` |
| `version` | `string` | Phiên bản quy trình | `"V1.0"`, `"V2.1"` |
| `owner_org_id` | `string` | Mã phòng ban / đơn vị sở hữu quy trình | `"ORG_CSKH_MB"` |
| `owner_org_name`| `string` | Tên phòng ban / đơn vị sở hữu | `"TT CSKH Miền Bắc"` |
| `sla` | `string` | Thời hạn cam kết xử lý toàn bộ quy trình | `"2h SLA"`, `"4h SLA"` |
| `status` | `string` | Trạng thái: `Draft` (Nháp) \| `Published` (Ban hành) \| `Inactive` | `"Published"` |
| `description` | `string` | Mô tả chi tiết mục tiêu của quy trình | `"Quy trình tiếp nhận..."` |

---

### 2.2. `executionGraph` (Đồ thị thực thi luồng dành cho BE Engine)
Phần này giúp BE:
1. Kiểm tra tính hợp lệ đồ thị (DAG - Directed Acyclic Graph).
2. Xác định điểm bắt đầu (`entryNodeId`) và các điểm kết thúc (`exitNodeIds`).
3. Khởi tạo instance và chuyển bước tự động khi có sự kiện (Task hoàn thành, API trả lời, Thỏa mãn điều kiện).

#### Danh sách `nodes`:
Mỗi node đại diện cho 1 bước nghiệp vụ, có `type` và `config` riêng biệt tương ứng với form cấu hình bên Drawer FE:

1. **`trigger` (Bắt đầu):**
   - `triggerType`: Kênh khởi tạo (`"Webhook"`, `"Inbound Call"`, `"Form Portal"`, `"NMS Monitor"`).
   - `triggerEvent`: Tên sự kiện kích hoạt.
   - `triggerFormSchedule`: Lịch trình kích hoạt (`"Tức thời (Real-time)"` hoặc định kỳ).

2. **`task` (Giao việc - User Task):**
   - `department`: Đơn vị xử lý (VD: `"TT CSKH Miền Bắc"`).
   - `team`: Nhóm xử lý (VD: `"Nhóm Chăm sóc khách hàng"`).
   - `agent` / `assignee`: Vai trò nhân sự phụ trách (`"Điện thoại viên (FO/BO)"`, `"Trưởng ca"`).
   - `sla`: Thời hạn xử lý của riêng bước này (VD: `"30 phút"`, `"1h"`).
   - `slaWarning`: Bật/Tắt cờ cảnh báo sắp hết hạn SLA (`true`/`false`).
   - `isApprovalStep`: Cờ xác định đây có phải bước Phê duyệt (Approval) hay không.
   - `formTemplate`: Mã biểu mẫu nhập liệu khi nhân viên mở task (VD: `"FORM_CDR_VERIFY_V2"`).
   - `formOutput`: Tên biến lưu kết quả đầu ra vào context luồng (VD: `"output_verified_amount"`).

3. **`condition` / `split` (Điều kiện rẽ nhánh):**
   - `gatewayType`:
     - `"exclusive"`: Chọn một nhánh duy nhất theo điều kiện.
     - `"parallel"`: Chạy song song tất cả các nhánh.
     - `"inclusive"`: Chọn nhiều nhánh nếu thỏa mãn điều kiện.
   - `branches`: Danh sách nhánh cấu hình gồm `id`, `name`, `expression`, `rules` (tham số, toán tử so sánh, giá trị).
   - `defaultFlowOutput`: Nhánh mặc định (Default Flow) chạy khi không có điều kiện nào thỏa mãn.
   - `errorFlowOutput`: Nhánh xử lý khi có lỗi hoặc ngoại lệ (Error Flow).

4. **`action` (Tác vụ hệ thống - API):**
   - `integratedSystem`: Hệ thống tích hợp đích (VD: `"BILLING_CORE_BSS"`, `"CRM_CORE"`).
   - `actionMethod`: Phương thức HTTP (`"GET"`, `"POST"`, `"PUT"`, `"DELETE"`).
   - `actionEndpoint`: URL endpoint gọi API (hỗ trợ placeholder biến: `${flow.variables.sub_id}`).
   - `requestBodyMapping`: Template JSON payload gửi sang API đích.
   - `responseMapping`: Quy tắc trích xuất dữ liệu từ Response vào context biến của luồng.
   - `timeoutSeconds`: Thời gian timeout kết nối (giây).
   - `retryCount`: Số lần retry tự động khi API lỗi.
   - `retryInterval`: Khoảng thời gian giãn cách giữa các lần retry (VD: `"2s"`, `"5s"`).
   - `circuitBreakerTimeoutMs`: Ngưỡng ngắt mạch chống sập hệ thống (Circuit Breaker).

5. **`notification` (Gửi thông báo):**
   - `notificationChannel`: Kênh gửi (`"SMS"`, `"Email"`, `"SMS, Email"`).
   - `notificationRecipient`: Người nhận (hỗ trợ biến: `${flow.variables.customer_phone}`).
   - `notificationTitle`: Tiêu đề tin nhắn / email.
   - `notificationContent`: Nội dung thông điệp (hỗ trợ chèn biến linh hoạt).

6. **`sub_process` (Quy trình con):**
   - `subProcessTemplateId`: Mã quy trình con cần gọi (VD: `"PRC_BTS_SITE_MAINTENANCE"`).
   - `subProcessVersion`: Phiên bản quy trình con.
   - `subProcessWaitComplete`: Đợi quy trình con kết thúc mới đi tiếp hay chạy nền (`true`/`false`).
   - `subProcessInputMapping`: Tham số truyền vào cho quy trình con.

7. **`end` (Kết thúc):**
   - `endFormTemplate`: Biểu mẫu tổng kết hoặc mã lý do kết thúc.

#### Danh sách `transitions` (Đường nối chuyển bước):
- `fromNode`: `nodeKey` của bước nguồn.
- `toNode`: `nodeKey` của bước đích.
- `type`:
  - `"sequence"`: Chuyển bước tuần tự.
  - `"condition_branch"`: Nhánh rẽ điều kiện (kèm `branchId`, `conditionExpression`).
  - `"parallel_branch"`: Nhánh chạy song song.
  - `"parallel_join"`: Điểm hội tụ đồng bộ.
  - `"error_flow"`: Nhánh rẽ bắt lỗi ngoại lệ (Fallback/Exception).

---

### 2.3. `graphData` (Dành cho FE render AntV X6 Canvas)
- Chứa toàn bộ mảng `cells` (bao gồm tọa độ `x`, `y`, kích thước `width`, `height`, `ports`, hình dáng SVG `rect`, `circle`, `edge`...).
- **BE chỉ cần lưu trường này dưới dạng JSON/JSONB/Text vào cơ sở dữ liệu** mà không cần can thiệp logic; khi FE tải quy trình lên canvas sẽ gọi `graph.fromJSON(graphData)` để phục hồi 100% giao diện vẽ.

---

## 3. Danh Sách 3 File Mẫu Cung Cấp Kèm Theo

1. **Mẫu 1 - Cơ bản (Linear Basic Flow):**
   - File: `flow-1-basic-linear.json`
   - Kịch bản: Bắt đầu ➔ Giao việc phân loại CSAT ➔ Gửi SMS cảm ơn ➔ Kết thúc.
   - Phù hợp để BE: Kiểm thử luồng tuần tự đơn giản, lưu vết instance đầu cuối.

2. **Mẫu 2 - Trung bình (Condition Branching & System Action API):**
   - File: `flow-2-medium-condition-api.json`
   - Kịch bản: Tiếp nhận khiếu nại cước ➔ Tra cứu CDR ➔ Rẽ nhánh Điều kiện (Cước <= 200k thì tự động hoàn qua API Billing Core; Cước > 200k thì Trưởng ca phê duyệt) ➔ Gửi SMS ➔ Kết thúc / Luồng lỗi.
   - Phù hợp để BE: Kiểm thử engine đánh giá biểu thức logic (Expression Evaluator), gọi Webhook/REST API ngoài có Retry/Timeout và luồng bắt lỗi Exception.

3. **Mẫu 3 - Phức tạp Enterprise (Parallel Split, SubProcess, Multi-channel):**
   - File: `flow-3-complex-enterprise.json`
   - Kịch bản: Sự cố kênh truyền VIP ➔ Phân loại cấp 1 ➔ Chạy song song 2 nhánh:
     - Nhánh kỹ thuật: Gọi quy trình con (SubProcess) xử lý trạm BTS.
     - Nhánh CSKH: Quản lý KH VIP liên hệ ➔ Gửi thông báo đa kênh SMS & Email cam kết SLA 2h.
     - Hội tụ đồng bộ 2 nhánh ➔ Gọi API CRM đóng ticket ➔ Email biên bản nghiệm thu ➔ Kết thúc.
   - Phù hợp để BE: Kiểm thử tính năng Fork/Join đồng bộ (Parallel Gateways), gọi quy trình con lồng nhau (Subflow Execution), đồng bộ đa kênh và tính toán SLA cảnh báo.

---

## 4. Gợi Ý Thiết Kế Bảng Database Cho BE

```sql
-- 1. Bảng lưu trữ thông tin chung quy trình
CREATE TABLE process_template (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    version VARCHAR(20) NOT NULL,
    owner_org_id VARCHAR(64),
    owner_org_name VARCHAR(255),
    sla VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Draft',
    description TEXT,
    graph_data JSONB, -- Lưu nguyên bản graphData cho FE
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng lưu danh sách Node nghiệp vụ để Engine duyệt bước
CREATE TABLE process_node (
    id VARCHAR(64) PRIMARY KEY,
    template_code VARCHAR(64) REFERENCES process_template(code) ON DELETE CASCADE,
    node_key VARCHAR(64) NOT NULL,
    type VARCHAR(30) NOT NULL,
    label VARCHAR(255),
    config JSONB, -- Lưu chi tiết assignee, api, rules...
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng lưu chuyển bước & điều kiện
CREATE TABLE process_transition (
    id VARCHAR(64) PRIMARY KEY,
    template_code VARCHAR(64) REFERENCES process_template(code) ON DELETE CASCADE,
    from_node VARCHAR(64) NOT NULL,
    to_node VARCHAR(64) NOT NULL,
    type VARCHAR(30) DEFAULT 'sequence',
    condition_expression TEXT,
    is_default BOOLEAN DEFAULT FALSE
);
```
