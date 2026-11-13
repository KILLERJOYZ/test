"""
Script xóa sạch toàn bộ dữ liệu trong PostgreSQL và Qdrant,
nhưng GIỮ NGUYÊN các bảng, schema, cấu trúc collection và views.
"""

import os
import sys
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
STORER_DIR = Path(__file__).resolve().parent

load_dotenv(STORER_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


def clean_postgres():
    """Xóa toàn bộ dữ liệu trong các bảng PostgreSQL (TRUNCATE), giữ nguyên schema & bảng."""
    print("==================================================")
    print(" 1. DỌN DẸP DỮ LIỆU POSTGRESQL")
    print("==================================================")
    
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = int(os.getenv("DB_PORT", "5432"))
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    dbname = os.getenv("DB_NAME", "postgres")
    
    try:
        conn = psycopg2.connect(
            host=host, port=port, user=user, password=password, dbname=dbname
        )
        with conn.cursor() as cur:
            # Lấy danh sách tất cả các bảng trong schema public
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
            """)
            tables = [t[0] for t in cur.fetchall()]
            
            if not tables:
                print("[PostgreSQL] Không tìm thấy bảng nào trong schema public.")
            else:
                table_list_str = ", ".join([f'public."{t}"' for t in tables])
                print(f"[PostgreSQL] Tìm thấy các bảng: {tables}")
                print(f"[PostgreSQL] Đang thực thi TRUNCATE {table_list_str} CASCADE...")
                cur.execute(f"TRUNCATE TABLE {table_list_str} CASCADE;")
                conn.commit()
                print("[PostgreSQL] => ĐÃ XÓA TOÀN BỘ DỮ LIỆU THÀNH CÔNG! (Giữ nguyên cấu trúc bảng)")
                
                # Kiểm tra lại số dòng
                for t in tables:
                    cur.execute(f'SELECT COUNT(*) FROM public."{t}";')
                    cnt = cur.fetchone()[0]
                    print(f"   + Bảng '{t}': {cnt} dòng")
        conn.close()
    except Exception as e:
        print(f"[PostgreSQL] LỖI: Không thể dọn dẹp PostgreSQL: {e}")


def clean_qdrant():
    """Xóa toàn bộ points trong các collections của Qdrant (giữ nguyên collection schema)."""
    print("\n==================================================")
    print(" 2. DỌN DẸP DỮ LIỆU QDRANT")
    print("==================================================")
    
    host = os.getenv("QDRANT_HOST", "127.0.0.1")
    ports_to_check = [int(os.getenv("QDRANT_PORT", "6333")), 6335]
    
    from qdrant_client import QdrantClient
    from qdrant_client import models
    
    connected = False
    for port in ports_to_check:
        try:
            print(f"[Qdrant] Đang kiểm tra kết nối tới {host}:{port}...")
            client = QdrantClient(host=host, port=port, timeout=3.0)
            colls = client.get_collections().collections
            connected = True
            print(f"[Qdrant] Kết nối thành công tại cổng {port}!")
            
            if not colls:
                print("[Qdrant] Chưa có collection nào trong Qdrant.")
            else:
                for col in colls:
                    col_name = col.name
                    print(f"[Qdrant] Đang xóa toàn bộ points trong collection '{col_name}'...")
                    # Xóa tất cả points thông qua filter rỗng (giữ nguyên collection và index)
                    client.delete(
                        collection_name=col_name,
                        points_selector=models.FilterSelector(
                            filter=models.Filter()
                        )
                    )
                    info = client.get_collection(col_name)
                    print(f"[Qdrant] => Collection '{col_name}' hiện có: {info.points_count} points (Đã dọn sạch!)")
            break
        except Exception as e:
            print(f"[Qdrant] Cổng {port} không kết nối được ({e.__class__.__name__})")
            
    if not connected:
        print("[Qdrant] LƯU Ý: Server Qdrant hiện đang tắt / chưa được khởi động.")
        print("          Khi bạn khởi động Qdrant container, bạn có thể chạy lại script này:")
        print("          python storer/clean_data.py")


if __name__ == "__main__":
    clean_postgres()
    clean_qdrant()
