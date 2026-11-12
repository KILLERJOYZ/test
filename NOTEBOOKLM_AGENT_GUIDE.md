# Hướng Dẫn Cài Đặt & Cấu Hình NotebookLM MCP Từ Đầu Cho Máy Mới (Dành Cho AI Agent)

> **Mục tiêu**: Hướng dẫn này dành cho AI Agent thiết lập môi trường hoàn chỉnh từ con số 0 trên một máy tính bất kỳ (Windows, macOS hoặc Linux) để T3 Code và tất cả các Provider/Model kết nối được với Google NotebookLM.

---

## 1. Cài Đặt Công Cụ Từ Đầu (Prerequisites & Tooling)

Khuyến nghị sử dụng **`uv`** (Astral) vì công cụ này tự quản lý phiên bản Python, không làm bẩn môi trường hệ thống và cài đặt môi trường cô lập cực nhanh.

### Bước 1: Cài đặt `uv` (nếu máy chưa có)
- **Windows (PowerShell)**:
  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- **macOS / Linux**:
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

### Bước 2: Cài đặt package `notebooklm-mcp-cli`
Chạy lệnh sau để cài đặt công cụ CLI và MCP Server toàn cục:
```bash
uv tool install notebooklm-mcp-cli
```
*(Nếu dùng pip thông thường: `pip install notebooklm-mcp-cli`)*

Sau khi cài đặt, hệ thống sẽ có 2 lệnh binary sẵn sàng trong PATH (`~/.local/bin`):
1. **`nlm`**: CLI quản trị, xác thực, chẩn đoán (`nlm doctor`, `nlm notebook list`).
2. **`notebooklm-mcp`**: Máy chủ MCP chạy qua giao thức stdio (dùng cho T3 Code kết nối).

---

## 2. Xác Thực Tài Khoản Google NotebookLM

`notebooklm-mcp` lưu trữ thông tin xác thực tại:
- **Windows**: `%USERPROFILE%\.notebooklm-mcp-cli\profiles\default\`
- **macOS / Linux**: `~/.notebooklm-mcp-cli/profiles/default/`

Có 2 cách xác thực tùy thuộc vào môi trường của máy:

### Cách 1: Xác thực qua T3 Browser / DevTools (Khuyên dùng trong T3 Code — Không mở trình duyệt ngoài)
1. Trong T3 Code, mở NotebookLM trên tab preview: `preview_open(url="https://notebooklm.google.com")`.
2. Hướng dẫn người dùng đăng nhập Google nếu chưa đăng nhập.
3. Mở tab Network trong DevTools, copy **cURL** hoặc chuỗi **Cookie header** của một request bất kỳ tới `notebook.google.com` (ví dụ `batchexecute`).
4. Chạy script Python tự động nạp cookie và token:

```python
import json
import os
from pathlib import Path

# Đọc cookie từ cURL hoặc file cookie
raw_cookie = """<DÁN CHUỖI COOKIE HOẶC CURL VÀO ĐÂY>"""

# Lọc và chuẩn hóa cookies
cookies = {}
for item in raw_cookie.split(';'):
    if '=' in item:
        k, v = item.strip().split('=', 1)
        k = k.replace('*', '').replace('^', '').strip()
        cookies[k] = v.strip()

# Đường dẫn profile
profile_dir = Path.home() / ".notebooklm-mcp-cli" / "profiles" / "default"
profile_dir.mkdir(parents=True, exist_ok=True)

# Ghi cookies.json
with open(profile_dir / "cookies.json", "w", encoding="utf-8") as f:
    json.dump(cookies, f, indent=2)

# Ghi metadata.json (CSRF Token & Session ID)
# Lấy 'at' -> csrf_token, 'f.sid' -> session_id từ request cURL
meta = {
    "csrf_token": "<GIÁ_TRỊ_THAM_SỐ_at>",
    "session_id": "<GIÁ_TRỊ_THAM_SỐ_f.sid>",
    "email": "<EMAIL_NGƯỜI_DÙNG>",
    "build_label": "boq_labs-tailwind-frontend_20261105.11_p0",
    "base_host": "notebook.google.com",
    "browser_backend": None
}
with open(profile_dir / "metadata.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2)

print("Đã cấu hình profile thành công tại:", profile_dir)
```

### Cách 2: Xác thực tự động qua trình duyệt có sẵn (Chrome / Edge / Firefox)
Nếu máy có sẵn trình duyệt máy tính và người dùng đồng ý mở trình duyệt:
```bash
nlm login --storage file
```
- Trình duyệt sẽ mở ra trang Google NotebookLM. Người dùng đăng nhập xong, CLI sẽ tự động bắt toàn bộ cookie và đóng cửa sổ.

### Bước 3: Kiểm tra xác thực
Chạy lệnh kiểm tra:
```bash
nlm doctor
nlm notebook list
```
Nếu `nlm notebook list` trả về danh sách JSON các sổ tay, bước xác thực đã hoàn tất 100%.

---

## 3. Cấu Hình MCP Cho Toàn Bộ T3 Code & Các Provider

Để **bất kỳ provider nào** (OpenCode, Codex, Antigravity, Claude,...) và **mọi model** trong T3 Code đều sử dụng được, Agent cần cấu hình các file sau:

### 3.1. Cấu hình T3 Code Global MCP (Quan trọng nhất)
T3 Code tự động nạp các MCP server được khai báo trong:
- **Windows**: `%USERPROFILE%\.cursor\mcp.json`
- **macOS / Linux**: `~/.cursor/mcp.json`

Nội dung file:
```json
{
  "mcpServers": {
    "gemini-notebook-mcp": {
      "command": "notebooklm-mcp",
      "args": []
    }
  }
}
```
*(Nếu trên Windows không tự nhận PATH, hãy điền đường dẫn tuyệt đối: `C:\\Users\\<USERNAME>\\.local\\bin\\notebooklm-mcp.EXE`)*

### 3.2. Cấu hình cấp Workspace Dự Án (Project-level)
Tạo file `.cursor/mcp.json` và `.mcp.json` ngay tại thư mục gốc của project:
```json
{
  "mcpServers": {
    "gemini-notebook-mcp": {
      "command": "notebooklm-mcp",
      "args": []
    }
  }
}
```

### 3.3. Tự động liên kết vào các Provider cụ thể qua CLI
Chạy các lệnh setup tích hợp sẵn của `nlm`:
```bash
nlm setup add opencode      # Nạp vào ~/.config/opencode/opencode.json
nlm setup add codex         # Nạp vào ~/.codex/config.toml
nlm setup add antigravity   # Nạp vào ~/.gemini/antigravity/mcp_config.json
nlm setup add cursor        # Nạp vào cấu hình Cursor/T3 Code
```

---

## 4. Script Tự Động Hóa Dành Cho Agent (One-Click Setup)

Agent có thể tạo và thực thi script sau trên máy mới để tự động hóa toàn bộ các bước cài đặt và cấu hình:

```python
import os
import sys
import subprocess
import shutil
import json
from pathlib import Path

def run_cmd(cmd):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Stderr: {res.stderr}")
    return res

def setup():
    # 1. Cài đặt package qua uv hoặc pip
    has_uv = shutil.which("uv") is not None
    if has_uv:
        run_cmd("uv tool install --force notebooklm-mcp-cli")
    else:
        run_cmd(f"{sys.executable} -m pip install notebooklm-mcp-cli")

    home = Path.home()

    # 2. Xác định binary path
    mcp_bin = shutil.which("notebooklm-mcp")
    if not mcp_bin:
        if os.name == 'nt':
            mcp_bin = str(home / ".local" / "bin" / "notebooklm-mcp.exe")
        else:
            mcp_bin = str(home / ".local" / "bin" / "notebooklm-mcp")

    # 3. Cấu hình ~/.cursor/mcp.json (Global cho T3 Code)
    cursor_dir = home / ".cursor"
    cursor_dir.mkdir(parents=True, exist_ok=True)
    cursor_mcp = cursor_dir / "mcp.json"

    cfg = {"mcpServers": {}}
    if cursor_mcp.exists():
        try:
            cfg = json.loads(cursor_mcp.read_text(encoding="utf-8"))
        except Exception:
            pass

    cfg.setdefault("mcpServers", {})["gemini-notebook-mcp"] = {
        "command": mcp_bin,
        "args": []
    }
    cursor_mcp.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
    print(f"[OK] Cập nhật: {cursor_mcp}")

    # 4. Chạy nlm setup add cho các client
    run_cmd("nlm setup add opencode")
    run_cmd("nlm setup add codex")
    run_cmd("nlm setup add antigravity")
    run_cmd("nlm setup add cursor")

    print("\n=== HOÀN TẤT THIẾT LẬP HẠ TẦNG ===")
    print("Agent chỉ cần thực hiện bước Xác thực Cookie là hệ thống sẵn sàng hoạt động!")

if __name__ == "__main__":
    setup()
```

---

## 5. Bảng Kiểm Tra Sau Cài Đặt (Verification Checklist)

- [ ] Lệnh `nlm --version` và `notebooklm-mcp --help` chạy không lỗi.
- [ ] Profile tại `~/.notebooklm-mcp-cli/profiles/default/` có đủ `cookies.json` và `metadata.json`.
- [ ] Lệnh `nlm doctor` báo xanh (`Cookies: present`, `CSRF token: yes`, `Account: <email>`).
- [ ] Lệnh `nlm notebook list` trả về danh sách các sổ tay của người dùng.
- [ ] File `~/.cursor/mcp.json` và `<workspace>/.cursor/mcp.json` đã có mục `gemini-notebook-mcp`.
