import unittest
from starlette.testclient import TestClient

from backend.main import app

class TestLaptopAdviserAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["db"], "connected")
        self.assertGreater(data["laptopCount"], 0)

    def test_02_get_catalog(self):
        res = self.client.get("/v1/catalog")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("catalog", data)
        catalog = data["catalog"]
        self.assertEqual(catalog["schemaVersion"], 1)
        self.assertTrue(len(catalog["revision"]) > 0)
        self.assertIsInstance(catalog["listings"], list)
        self.assertGreater(len(catalog["listings"]), 0)

        # Kiểm tra 1 listing
        first = catalog["listings"][0]
        self.assertIn("id", first)
        self.assertIn("name", first)
        self.assertIn("source", first)
        self.assertIn("url", first)
        self.assertTrue(first["url"].startswith("https://"))
        self.assertIn("rawHash", first)

    def test_03_query_laptops_filter(self):
        res = self.client.get("/v1/laptops?source=cellphones&max_price=35000000&limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total", data)
        self.assertIn("items", data)
        for item in data["items"]:
            self.assertEqual(item["source"], "cellphones")
            if item["advertisedPrice"] is not None:
                self.assertLessEqual(item["advertisedPrice"], 35000000)

    def test_04_query_laptops_search(self):
        res = self.client.get("/v1/laptops?q=Lenovo&sort=price&limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total"], 0)
        # Check sort ascending
        prices = [x["advertisedPrice"] for x in data["items"] if x["advertisedPrice"] is not None]
        self.assertEqual(prices, sorted(prices))

    def test_05_laptop_detail_and_404(self):
        # Lấy 1 laptop hợp lệ từ catalog
        cat_res = self.client.get("/v1/catalog")
        first_id = cat_res.json()["catalog"]["listings"][0]["id"]

        detail_res = self.client.get(f"/v1/laptops/{first_id}")
        self.assertEqual(detail_res.status_code, 200)
        item = detail_res.json()
        self.assertEqual(item["id"], first_id)
        self.assertTrue(len(item["name"]) > 0)

        # Kiểm tra 404
        not_found = self.client.get("/v1/laptops/non-existing-uuid-999")
        self.assertEqual(not_found.status_code, 404)

    def test_06_compare_laptops(self):
        cat_res = self.client.get("/v1/catalog")
        listings = cat_res.json()["catalog"]["listings"]
        ids = [listings[0]["id"], listings[1]["id"]]

        payload = {
            "ids": ids,
            "requirements": {
                "budget": 30000000,
                "minRam": 16,
                "minStorage": 512,
                "os": "Windows",
                "tasks": ["Lập trình"]
            }
        }
        res = self.client.post("/v1/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["items"]), 2)
        self.assertEqual(len(data["assessments"]), 2)

    def test_07_advice_success_and_stale_rejection(self):
        cat_res = self.client.get("/v1/catalog")
        cat_data = cat_res.json()["catalog"]
        valid_revision = cat_data["revision"]
        first_id = cat_data["listings"][0]["id"]

        # 1. Thành công với revision đúng
        payload = {
            "context": {
                "catalogRevision": valid_revision,
                "decisionRevision": 1,
                "focusId": first_id,
                "requestId": "test-req-1"
            },
            "requirements": {
                "budget": 25000000,
                "minRam": 16,
                "minStorage": 512,
                "os": "Windows",
                "tasks": ["Lập trình"]
            },
            "message": "Máy này có đủ ram 16gb làm việc không?"
        }
        res = self.client.post("/v1/advice", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("text", data)
        self.assertTrue(len(data["text"]) > 0)
        self.assertEqual(data["mode"], "provider")

        # 2. Thất bại 409 khi catalogRevision bị cũ/sai
        stale_payload = dict(payload)
        stale_payload["context"] = dict(payload["context"])
        stale_payload["context"]["catalogRevision"] = "stale-fake-revision"
        stale_res = self.client.post("/v1/advice", json=stale_payload)
        self.assertEqual(stale_res.status_code, 409)
        self.assertEqual(stale_res.json()["code"], "STALE_CATALOG")

    def test_08_advice_validation_error(self):
        # Gửi payload thiếu trường bắt buộc
        invalid_payload = {
            "requirements": {"budget": -100}
        }
        res = self.client.post("/v1/advice", json=invalid_payload)
        self.assertEqual(res.status_code, 422)

    def test_09_submit_listing_report(self):
        cat_res = self.client.get("/v1/catalog")
        first_id = cat_res.json()["catalog"]["listings"][0]["id"]
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
        self.assertIn("report", data)
        self.assertEqual(data["report"]["listingId"], first_id)
        self.assertEqual(data["report"]["category"], "price")

if __name__ == "__main__":
    unittest.main()
