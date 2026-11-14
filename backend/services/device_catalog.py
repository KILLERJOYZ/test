"""Versioned, signed device catalog served by the same API as laptop operations."""
import base64
from collections import OrderedDict
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
from pathlib import Path
from threading import RLock
from typing import Optional

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

from backend.config import ADVISER_SIGNING_PASSPHRASE

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "apps" / "adviser"

_LEGACY_KEY_FILE = APP / ".expo/catalog-publisher/private.pem"
_DEFAULT_HOME_KEY_FILE = Path.home() / ".lua-adviser/catalog-publisher/private.pem"


def _compute_default_key_file() -> Path:
    env_key = os.getenv("ADVISER_SIGNING_KEY", "").strip()
    if env_key:
        return Path(env_key)
    if _LEGACY_KEY_FILE.exists():
        return _LEGACY_KEY_FILE
    return _DEFAULT_HOME_KEY_FILE


KEY_FILE = _compute_default_key_file()
_snapshots: "OrderedDict[str, str]" = OrderedDict()
_envelopes: "OrderedDict[str, dict]" = OrderedDict()
_last_revision_number: int = 0
_lock = RLock()


def _resolve_key_file() -> Path:
    env_key = os.getenv("ADVISER_SIGNING_KEY", "").strip()
    if env_key:
        return Path(env_key)
    return KEY_FILE


def _resolve_passphrase() -> Optional[bytes]:
    env_pass = os.getenv("ADVISER_SIGNING_PASSPHRASE")
    raw = env_pass if env_pass is not None else ADVISER_SIGNING_PASSPHRASE
    return raw.encode("utf-8") if raw else None


def prepare_publisher():
    key_path = _resolve_key_file()
    passphrase = _resolve_passphrase()
    key_path.parent.mkdir(parents=True, exist_ok=True)
    if not key_path.exists():
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        encryption = (
            serialization.BestAvailableEncryption(passphrase)
            if passphrase
            else serialization.NoEncryption()
        )
        # Exclusive creation avoids replacing another publisher's identity.
        with key_path.open("xb") as f:
            f.write(
                key.private_bytes(
                    serialization.Encoding.PEM,
                    serialization.PrivateFormat.PKCS8,
                    encryption,
                )
            )
    key = serialization.load_pem_private_key(key_path.read_bytes(), password=passphrase)
    public = key.public_key().public_bytes(
        serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
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
            "id": v.id,
            "name": v.name,
            "brand": v.brand or "",
            "source": v.source,
            "url": v.url,
            "condition": v.condition,
            "availability": "unknown",
            "price": v.advertisedPrice,
            "ramGiB": v.ram,
            "storageGiB": v.storage,
            "weightKg": None,
            "observedAt": v.observedAt,
            "category": "laptop",
            "specs": {
                "ram": v.ram,
                "storage": v.storage,
                "cpu": v.cpu,
                "os": v.os,
                "screen": v.screen,
                "gpu": v.gpu,
            },
        })
    return rows


def signed_snapshot():
    global _last_revision_number
    key_path = _resolve_key_file()
    if not key_path.exists():
        raise RuntimeError("Run npm run catalog:prepare and rebuild the app with its public pin")
    passphrase = _resolve_passphrase()
    key = serialization.load_pem_private_key(key_path.read_bytes(), password=passphrase)
    public = base64.b64encode(
        key.public_key().public_bytes(
            serialization.Encoding.DER,
            serialization.PublicFormat.SubjectPublicKeyInfo,
        )
    ).decode()
    trust = json.loads((APP / "src/catalog-trust.json").read_text(encoding="utf-8"))
    if trust.get("publicKey") != public:
        raise RuntimeError("Publisher identity differs from app pin; prepare and rebuild deliberately")

    rows = catalog_rows()
    canonical = json.dumps(rows, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    version = hashlib.sha256(canonical.encode()).hexdigest()[:24]

    with _lock:
        cached_env = _envelopes.get(version)
        if cached_env is not None and version in _snapshots and cached_env.get("publicKey") == public:
            _snapshots.move_to_end(version)
            _envelopes.move_to_end(version)
            return {
                "payload": cached_env["payload"],
                "signature": cached_env["signature"],
            }

        now_utc = datetime.now(timezone.utc)
        _last_revision_number = max(_last_revision_number + 1, int(now_utc.timestamp()))
        revision_number = _last_revision_number
        valid_until = (
            (now_utc + timedelta(days=30))
            .replace(microsecond=0)
            .isoformat()
            .replace("+00:00", "Z")
        )

        bundle = json.dumps(
            {
                "schemaVersion": 1,
                "market": "VN",
                "catalogVersion": version,
                "revisionNumber": revision_number,
                "validUntil": valid_until,
                "rows": rows,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        )
        raw = bundle.encode("utf-8")
        if len(raw) > 3_000_000:
            raise ValueError("Catalog exceeds client size limit")

        payload = json.dumps(
            {
                "schemaVersion": 1,
                "market": "VN",
                "catalogVersion": version,
                "revisionNumber": revision_number,
                "validUntil": valid_until,
                "minAppVersion": 1,
                "bytes": len(raw),
                "sha256": hashlib.sha256(raw).hexdigest(),
            },
            separators=(",", ":"),
        )
        signature = base64.b64encode(
            key.sign(payload.encode("utf-8"), padding.PKCS1v15(), hashes.SHA256())
        ).decode()

        _snapshots[version] = bundle
        _snapshots.move_to_end(version)
        _envelopes[version] = {
            "payload": payload,
            "signature": signature,
            "publicKey": public,
            "revisionNumber": revision_number,
            "validUntil": valid_until,
        }
        _envelopes.move_to_end(version)
        while len(_snapshots) > 4:
            evicted_ver, _ = _snapshots.popitem(last=False)
            _envelopes.pop(evicted_ver, None)

        return {"payload": payload, "signature": signature}


def get_snapshot(version):
    with _lock:
        return _snapshots.get(version)
