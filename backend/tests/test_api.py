from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from starlette.testclient import TestClient

from backend import db as backend_db
from backend.main import app, reset_report_guards
from backend.services import device_catalog


class TestLaptopAdviserAPI(unittest.TestCase):
    def setUp(self):
        reset_report_guards()
        self.client = TestClient(app)

    def test_01_health_check_repository_and_postgresql_modes(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")
        if data["refresh"] == "repository":
            self.assertEqual(data["db"], "not_required")
        else:
            self.assertEqual(data["db"], "connected")
        self.assertGreater(data["laptopCount"], 0)

        with patch.dict("os.environ", {"ADVISER_CATALOG_SOURCE": "postgresql"}), patch(
            "backend.main.fetch_laptop_count", return_value=70
        ):
            pg_res = self.client.get("/health")
            self.assertEqual(pg_res.status_code, 200)
            self.assertEqual(pg_res.json()["db"], "connected")
            self.assertEqual(pg_res.json()["refresh"], "postgresql")

    def test_02_get_catalog(self):
        res = self.client.get("/v1/catalog")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("catalog", data)
        catalog = data["catalog"]
        self.assertEqual(catalog["schemaVersion"], 1)
        self.assertTrue(len(catalog["revision"]) > 0)
        self.assertIsInstance(catalog["listings"], list)
        self.assertEqual(len(catalog["listings"]), 70)

        first = catalog["listings"][0]
        self.assertIn("id", first)
        self.assertIn("name", first)
        self.assertIn("source", first)
        self.assertIn("url", first)
        self.assertTrue(first["url"].startswith("https://"))
        self.assertIn("rawHash", first)

    def test_03_query_laptops_pagination_and_filters(self):
        # Default limit=12 with pagination metadata
        default_res = self.client.get("/v1/laptops")
        self.assertEqual(default_res.status_code, 200)
        page1 = default_res.json()
        self.assertEqual(page1["limit"], 12)
        self.assertEqual(page1["offset"], 0)
        self.assertEqual(page1["total"], 70)
        self.assertTrue(page1["hasMore"])
        self.assertEqual(len(page1["items"]), 12)

        # Last page hasMore=False
        last_res = self.client.get("/v1/laptops?limit=12&offset=60")
        self.assertEqual(last_res.status_code, 200)
        last_page = last_res.json()
        self.assertFalse(last_page["hasMore"])
        self.assertEqual(len(last_page["items"]), 10)

        # Filter source, max_price, min_ram, min_storage (F-17)
        res = self.client.get(
            "/v1/laptops?source=cellphones&max_price=35000000&min_ram=16&min_storage=512&limit=10"
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(len(data["items"]), 0)
        for item in data["items"]:
            self.assertEqual(item["source"], "cellphones")
            self.assertLessEqual(item["advertisedPrice"], 35000000)
            self.assertGreaterEqual(item["ram"], 16)
            self.assertGreaterEqual(item["storage"], 512)

    def test_04_query_laptops_search_and_sort_modes(self):
        for sort_mode in ("price", "total", "fit", "name", "price_desc"):
            res = self.client.get(f"/v1/laptops?q=Lenovo&sort={sort_mode}&limit=8")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertGreater(data["total"], 0)
            if sort_mode == "price":
                prices = [x["advertisedPrice"] for x in data["items"] if x["advertisedPrice"] is not None]
                self.assertEqual(prices, sorted(prices))
            elif sort_mode == "price_desc":
                prices = [x["advertisedPrice"] for x in data["items"] if x["advertisedPrice"] is not None]
                self.assertEqual(prices, sorted(prices, reverse=True))

    def test_05_laptop_detail_and_404(self):
        cat_res = self.client.get("/v1/catalog")
        first_id = cat_res.json()["catalog"]["listings"][0]["id"]

        detail_res = self.client.get(f"/v1/laptops/{first_id}")
        self.assertEqual(detail_res.status_code, 200)
        item = detail_res.json()
        self.assertEqual(item["id"], first_id)
        self.assertTrue(len(item["name"]) > 0)

        not_found = self.client.get("/v1/laptops/non-existing-uuid-999")
        self.assertEqual(not_found.status_code, 404)
        self.assertEqual(not_found.json()["code"], "NOT_FOUND")

    def test_06_compare_up_to_4_laptops(self):
        cat_res = self.client.get("/v1/catalog")
        listings = cat_res.json()["catalog"]["listings"]
        ids_4 = [listings[i]["id"] for i in range(4)]

        payload = {
            "ids": ids_4,
            "requirements": {
                "budget": 30000000,
                "minRam": 16,
                "minStorage": 512,
                "os": "Windows",
                "tasks": ["Lập trình"],
            },
        }
        res = self.client.post("/v1/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["items"]), 4)
        self.assertEqual(len(data["assessments"]), 4)

        # 5 items rejected (max_length=4)
        too_many = dict(payload, ids=[listings[i]["id"] for i in range(5)])
        self.assertEqual(self.client.post("/v1/compare", json=too_many).status_code, 422)

    def test_07_advice_success_and_stale_rejection(self):
        cat_res = self.client.get("/v1/catalog")
        cat_data = cat_res.json()["catalog"]
        valid_revision = cat_data["revision"]
        first_id = cat_data["listings"][0]["id"]

        payload = {
            "context": {
                "catalogRevision": valid_revision,
                "decisionRevision": 1,
                "focusId": first_id,
                "requestId": "test-req-1",
            },
            "requirements": {
                "budget": 25000000,
                "minRam": 16,
                "minStorage": 512,
                "os": "Windows",
                "tasks": ["Lập trình"],
            },
            "message": "Máy này có đủ ram 16gb làm việc không?",
        }
        res = self.client.post("/v1/advice", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("text", data)
        self.assertTrue(len(data["text"]) > 0)
        self.assertEqual(data["mode"], "provider")

        stale_payload = dict(payload)
        stale_payload["context"] = dict(payload["context"])
        stale_payload["context"]["catalogRevision"] = "stale-fake-revision"
        stale_res = self.client.post("/v1/advice", json=stale_payload)
        self.assertEqual(stale_res.status_code, 409)
        self.assertEqual(stale_res.json()["code"], "STALE_CATALOG")

    def test_08_advice_validation_error(self):
        invalid_payload = {"requirements": {"budget": -100}}
        res = self.client.post("/v1/advice", json=invalid_payload)
        self.assertEqual(res.status_code, 422)

    def test_09_submit_report_dedup_rate_limit_and_size_guard(self):
        cat_res = self.client.get("/v1/catalog")
        first_id = cat_res.json()["catalog"]["listings"][0]["id"]

        with tempfile.TemporaryDirectory() as tmpdir, patch.object(
            device_catalog, "APP", Path(tmpdir)
        ):
            res = self.client.post(
                "/v1/reports",
                json={
                    "listingId": first_id,
                    "category": "price",
                    "note": "Báo kiểm tra tin đăng",
                },
            )
            self.assertEqual(res.status_code, 201)
            data = res.json()
            self.assertEqual(data["report"]["listingId"], first_id)

            # Duplicate within 5 minutes -> 409 DUPLICATE_REPORT
            dup_res = self.client.post(
                "/v1/reports",
                json={
                    "listingId": f"  {first_id}  ",
                    "category": "price",
                    "note": "  Báo kiểm tra tin đăng ",
                },
            )
            self.assertEqual(dup_res.status_code, 409)
            self.assertEqual(dup_res.json()["code"], "DUPLICATE_REPORT")

            # Body > 4000 bytes -> 413 INVALID_REPORT
            oversized = self.client.post(
                "/v1/reports",
                content=('{"listingId":"x","category":"price","note":"' + ("a" * 4100) + '"}').encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
            self.assertIn(oversized.status_code, (400, 413))
            self.assertEqual(oversized.json()["code"], "INVALID_REPORT")

            # Per-IP rate limit: 10 requests / 60s -> 11th request hits 429 RATE_LIMITED
            reset_report_guards()
            for idx in range(10):
                ok = self.client.post(
                    "/v1/reports",
                    json={
                        "listingId": first_id,
                        "category": "stock",
                        "note": f"Report #{idx}",
                    },
                )
                self.assertEqual(ok.status_code, 201)
            limited = self.client.post(
                "/v1/reports",
                json={
                    "listingId": first_id,
                    "category": "stock",
                    "note": "Report #11",
                },
            )
            self.assertEqual(limited.status_code, 429)
            self.assertEqual(limited.json()["code"], "RATE_LIMITED")

    def test_10_cors_restricts_to_localhost_without_credentials(self):
        ok_cors = self.client.options(
            "/v1/catalog",
            headers={
                "Origin": "http://localhost:8081",
                "Access-Control-Request-Method": "GET",
            },
        )
        self.assertEqual(ok_cors.headers.get("access-control-allow-origin"), "http://localhost:8081")
        self.assertIsNone(ok_cors.headers.get("access-control-allow-credentials"))

        blocked_cors = self.client.options(
            "/v1/catalog",
            headers={
                "Origin": "https://attacker.example.com",
                "Access-Control-Request-Method": "GET",
            },
        )
        self.assertIsNone(blocked_cors.headers.get("access-control-allow-origin"))

    def test_11_db_pool_and_sql_ram_storage_filters(self):
        fake_pool = MagicMock()
        fake_pool.closed = False
        fake_conn = MagicMock()
        fake_conn.closed = 0
        fake_cursor = MagicMock()
        fake_cursor.fetchone.return_value = {"count": 1}
        fake_cursor.fetchall.return_value = []
        fake_conn.cursor.return_value.__enter__.return_value = fake_cursor
        fake_pool.getconn.return_value = fake_conn

        with patch.object(backend_db, "_pool", fake_pool), patch.object(
            backend_db, "_table_ensured", True
        ):
            out = backend_db.query_laptops(min_ram=16, min_storage=1024, limit=12, offset=0)
            self.assertEqual(out["total"], 1)
            fake_pool.getconn.assert_called_once()
            fake_pool.putconn.assert_called_once_with(fake_conn, close=False)
            executed_sql = fake_cursor.execute.call_args_list[0][0][0]
            executed_params = fake_cursor.execute.call_args_list[0][0][1]
            self.assertIn("1024", executed_sql)  # 1 TB -> * 1024 conversion in SQL
            self.assertIn(16, executed_params)
            self.assertIn(1024, executed_params)

    def test_12_postgresql_outage_fails_closed_503_across_endpoints(self):
        with patch.dict("os.environ", {"ADVISER_CATALOG_SOURCE": "postgresql"}), patch(
            "backend.db._get_pool", side_effect=RuntimeError("PostgreSQL unreachable")
        ):
            for route in ("/health", "/v1/catalog", "/v1/laptops", "/v1/laptops/test-1"):
                r = self.client.get(route)
                self.assertEqual(r.status_code, 503)
                self.assertEqual(r.json()["code"], "SOURCE_UNAVAILABLE")


if __name__ == "__main__":
    unittest.main()
