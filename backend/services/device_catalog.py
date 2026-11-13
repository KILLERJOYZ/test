"""Versioned, signed device catalog served by the same API as laptop operations."""
import hashlib
import json
import os
from pathlib import Path
from collections import OrderedDict
from threading import RLock

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
import base64

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "apps" / "adviser"
KEY_FILE = Path(os.getenv("ADVISER_SIGNING_KEY", str(APP / ".expo/catalog-publisher/private.pem")))
_snapshots = OrderedDict()
_lock = RLock()


def prepare_publisher():
    KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not KEY_FILE.exists():
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        # Exclusive creation avoids replacing another publisher's identity.
        with KEY_FILE.open("xb") as f:
            f.write(key.private_bytes(serialization.Encoding.PEM,
                serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
    key = serialization.load_pem_private_key(KEY_FILE.read_bytes(), password=None)
    public = key.public_key().public_bytes(serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo)
    pin = {"publicKey": base64.b64encode(public).decode()}
    (APP / "src/catalog-trust.json").write_text(json.dumps(pin, indent=2) + "\n", encoding="utf-8")
    return pin


def catalog_source():
    source = os.getenv("ADVISER_CATALOG_SOURCE", "repository")
    if source not in ("repository", "postgresql"):
        raise ValueError("ADVISER_CATALOG_SOURCE must be repository or postgresql")
    return source


def catalog_rows():
    seed = json.loads((APP / "src/reference-seed.json").read_text(encoding="utf-8"))
    if catalog_source() == "repository":
        return seed["rows"]
    # An explicitly selected database outage is a failure, never an implicit source switch.
    from backend.services.catalog_service import build_catalog_snapshot
    listings = build_catalog_snapshot().listings
    rows = [r for r in seed["rows"] if r.get("category", "laptop") != "laptop"]
    for v in listings:
        rows.append({
            "id": v.id, "name": v.name, "brand": v.brand or "", "source": v.source,
            "url": v.url, "condition": v.condition, "availability": "unknown",
            "price": v.advertisedPrice, "ramGiB": v.ram, "storageGiB": v.storage,
            "weightKg": None, "observedAt": v.observedAt, "category": "laptop",
            "specs": {"ram": v.ram, "storage": v.storage, "cpu": v.cpu,
                      "os": v.os, "screen": v.screen, "gpu": v.gpu},
        })
    return rows


def signed_snapshot():
    if not KEY_FILE.exists():
        raise RuntimeError("Run npm run catalog:prepare and rebuild the app with its public pin")
    rows = catalog_rows()
    canonical = json.dumps(rows, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    version = hashlib.sha256(canonical.encode()).hexdigest()[:24]
    bundle = json.dumps({"schemaVersion": 1, "market": "VN", "catalogVersion": version,
        "rows": rows}, ensure_ascii=False, separators=(",", ":"))
    raw = bundle.encode()
    if len(raw) > 3_000_000:
        raise ValueError("Catalog exceeds client size limit")
    payload = json.dumps({"schemaVersion": 1, "market": "VN", "catalogVersion": version,
        "minAppVersion": 1, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()},
        separators=(",", ":"))
    key = serialization.load_pem_private_key(KEY_FILE.read_bytes(), password=None)
    public = base64.b64encode(key.public_key().public_bytes(
        serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)).decode()
    trust = json.loads((APP / "src/catalog-trust.json").read_text(encoding="utf-8"))
    if trust.get("publicKey") != public:
        raise RuntimeError("Publisher identity differs from app pin; prepare and rebuild deliberately")
    signature = base64.b64encode(key.sign(payload.encode(), padding.PKCS1v15(), hashes.SHA256())).decode()
    with _lock:
        _snapshots[version] = bundle
        _snapshots.move_to_end(version)
        while len(_snapshots) > 4:
            _snapshots.popitem(last=False)
    return {"payload": payload, "signature": signature}


def get_snapshot(version):
    with _lock:
        return _snapshots.get(version)
