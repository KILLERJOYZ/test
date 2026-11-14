import base64
from contextlib import closing
from datetime import datetime
import hashlib
import json
from pathlib import Path
import secrets
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from fastapi.testclient import TestClient

from backend.main import app, enforce_cli_auth_policy, reset_report_guards
from backend.services import device_catalog


class UnifiedApiTests(unittest.TestCase):
    def setUp(self):
        reset_report_guards()
        self.client = TestClient(app)

    def test_repository_health_does_not_require_postgresql(self):
        with patch.dict("os.environ", {"ADVISER_CATALOG_SOURCE": "repository"}), patch(
            "backend.main.fetch_laptop_count", side_effect=AssertionError("unexpected DB access")
        ):
            result = self.client.get("/health")
            self.assertEqual(result.status_code, 200)
            self.assertEqual(result.json()["refresh"], "repository")
            self.assertEqual(result.json()["db"], "not_required")

    def test_signed_manifest_and_immutable_bundle_cover_all_device_groups(self):
        response = self.client.get("/advisor/v1/manifest")
        self.assertEqual(response.status_code, 200)
        envelope = response.json()
        public = json.loads((device_catalog.APP / "src/catalog-trust.json").read_text())["publicKey"]
        key = serialization.load_der_public_key(base64.b64decode(public))
        key.verify(
            base64.b64decode(envelope["signature"]),
            envelope["payload"].encode(),
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
        manifest = json.loads(envelope["payload"])
        self.assertGreaterEqual(manifest["revisionNumber"], 1)
        self.assertTrue(manifest["validUntil"].endswith("Z"))
        datetime.fromisoformat(manifest["validUntil"].replace("Z", "+00:00"))

        bundle = self.client.get(f'/advisor/v1/catalogs/{manifest["catalogVersion"]}/bundle')
        self.assertEqual(len(bundle.content), manifest["bytes"])
        self.assertEqual(hashlib.sha256(bundle.content).hexdigest(), manifest["sha256"])
        bundle_json = bundle.json()
        self.assertEqual(bundle_json["revisionNumber"], manifest["revisionNumber"])
        self.assertEqual(bundle_json["validUntil"], manifest["validUntil"])
        categories = {r.get("category", "laptop") for r in bundle_json["rows"]}
        self.assertEqual(categories, {"phone", "tablet", "laptop", "desktop"})
        repeated = self.client.get("/advisor/v1/manifest").json()
        self.assertEqual(envelope["payload"], repeated["payload"])

    def test_monotonic_revision_number_and_encrypted_signing_key(self):
        seed_rows = device_catalog.catalog_rows()
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            (tmp / "src").mkdir(parents=True, exist_ok=True)
            key_file = tmp / "publisher" / "private.pem"

            with patch.object(device_catalog, "APP", tmp), patch.dict(
                "os.environ",
                {
                    "ADVISER_SIGNING_KEY": str(key_file),
                    "ADVISER_SIGNING_PASSPHRASE": "strong-test-passphrase",
                },
            ):
                pin = device_catalog.prepare_publisher()
                self.assertIn("publicKey", pin)
                self.assertIn(b"ENCRYPTED", key_file.read_bytes())

                with patch.object(device_catalog, "catalog_rows", return_value=seed_rows[:3]):
                    env1 = device_catalog.signed_snapshot()
                m1 = json.loads(env1["payload"])

                with patch.object(device_catalog, "catalog_rows", return_value=seed_rows[:4]):
                    env2 = device_catalog.signed_snapshot()
                m2 = json.loads(env2["payload"])

                self.assertGreater(m2["revisionNumber"], m1["revisionNumber"])
                self.assertNotEqual(m1["catalogVersion"], m2["catalogVersion"])

    def test_unknown_bundle_does_not_redirect_to_different_snapshot(self):
        self.assertEqual(self.client.get("/advisor/v1/catalogs/missing/bundle").status_code, 409)

    def test_auth_applies_to_both_signed_routes_with_constant_time_check(self):
        with patch("backend.main.API_TOKEN", "test-token"), patch(
            "backend.main.secrets.compare_digest", wraps=secrets.compare_digest
        ) as spy_digest:
            self.assertEqual(self.client.get("/advisor/v1/manifest").status_code, 401)
            self.assertEqual(self.client.get("/advisor/v1/catalogs/missing/bundle").status_code, 401)
            self.assertEqual(self.client.get("/v1/laptops").status_code, 401)
            self.assertEqual(self.client.get("/v1/laptops/missing").status_code, 401)
            ok = self.client.get(
                "/advisor/v1/manifest", headers={"Authorization": "Bearer test-token"}
            )
            self.assertEqual(ok.status_code, 200)
            self.assertGreaterEqual(spy_digest.call_count, 2)

    def test_cli_auth_policy_fails_closed_unless_token_or_demo_flag(self):
        with self.assertRaises(RuntimeError):
            enforce_cli_auth_policy(token="", demo_no_auth=False)
        enforce_cli_auth_policy(token="prod-secret-token", demo_no_auth=False)
        enforce_cli_auth_policy(token="", demo_no_auth=True)

    def test_database_outage_never_silently_changes_selected_source(self):
        with patch.dict("os.environ", {"ADVISER_CATALOG_SOURCE": "postgresql"}), patch(
            "backend.services.catalog_service.build_catalog_snapshot",
            side_effect=RuntimeError("offline"),
        ):
            self.assertEqual(self.client.get("/advisor/v1/manifest").status_code, 503)

    def test_report_acknowledgement_is_durable(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(
            device_catalog, "APP", Path(directory)
        ):
            response = self.client.post(
                "/v1/reports",
                json={"listingId": "phone:reference", "category": "spec", "note": "Test report"},
            )
            self.assertEqual(response.status_code, 201)
            report = response.json()["report"]
            with closing(sqlite3.connect(Path(directory) / ".expo/reports.sqlite")) as db:
                stored = json.loads(
                    db.execute("SELECT payload FROM reports WHERE id=?", (report["id"],)).fetchone()[0]
                )
            self.assertEqual(stored["listingId"], "phone:reference")


if __name__ == "__main__":
    unittest.main()
