"""Normalize collected source observations; do not fill missing facts or charges."""
from pathlib import Path
import hashlib
import json
import re

root = Path(__file__).resolve().parents[2]
raw = (root / 'data/all_laptops_normalized.json').read_bytes()
document = json.loads(raw)

def capacity(value):
    match = re.match(r'^\s*(\d+(?:\.\d+)?)\s*(GB|TB)\b', str(value or ''), re.I)
    return int(float(match[1]) * (1024 if match[2].upper() == 'TB' else 1)) if match else None

rows = []
for product in document['products']:
    specs = product.get('specs') or {}
    price = (product.get('pricing') or {}).get('current')
    weight = re.search(r'(\d+(?:[.,]\d+)?)\s*kg', str(specs.get('weight') or ''), re.I)
    rows.append(dict(
        id=product['id'], name=product['name'], brand=product.get('brand') or '',
        source=product['source'], url=product['url'], condition=product.get('condition') or 'unknown',
        availability=product.get('availability') or 'unknown',
        price=price if isinstance(price, int) and not isinstance(price, bool) and price > 0 else None,
        ramGiB=capacity(specs.get('ram')), storageGiB=capacity(specs.get('storage')),
        weightKg=float(weight[1].replace(',', '.')) if weight else None,
        observedAt=(product.get('metadata') or {}).get('crawledAt') or document['generatedAt'], specs=specs,
    ))
extra=(root/'data/manufacturer-device-references.json').read_bytes()
rows.extend(json.loads(extra))
raw+=extra
assert len({r['id'] for r in rows}) == len(rows), 'Duplicate source-listing identity'
seed = dict(version=hashlib.sha256(raw).hexdigest()[:16], generatedAt=max(r['observedAt'] for r in rows), rows=rows)
target = root / 'apps/adviser/src/reference-seed.json'
target.write_text(json.dumps(seed, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(f'Normalized {len(rows)} records; missing fields remain unknown.')
