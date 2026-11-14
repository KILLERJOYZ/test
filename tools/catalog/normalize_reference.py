"""Normalize collected source observations; do not invent missing facts or charges."""
from pathlib import Path
import hashlib
import json
import re

root = Path(__file__).resolve().parents[2]
raw = (root / 'data/all_laptops_normalized.json').read_bytes()
document = json.loads(raw)


def capacity(value, is_storage=False):
    match = re.search(r'(\d+(?:\.\d+)?)\s*(GB|TB)\b', str(value or ''), re.I)
    if not match:
        return None
    mult = 1024 if (is_storage or match[2].upper() == 'TB') and match[2].upper() == 'TB' else 1
    val = int(float(match[1]) * mult)
    return val if val > 0 else None


rows = []
for product in document['products']:
    specs = product.get('specs') or {}
    pricing = product.get('pricing') or {}
    media = product.get('media') or {}
    rating = product.get('rating') or {}
    price = pricing.get('current')
    weight = re.search(r'(\d+(?:[.,]\d+)?)\s*kg', str(specs.get('weight') or ''), re.I)
    row = dict(
        id=product['id'],
        name=product['name'],
        brand=product.get('brand') or '',
        model=product.get('model'),
        source=product['source'],
        url=product['url'],
        condition=product.get('condition') or 'unknown',
        availability=product.get('availability') or 'unknown',
        category=product.get('category') or 'laptop',
        price=price if isinstance(price, int) and not isinstance(price, bool) and price > 0 else None,
        priceOriginal=pricing.get('original') if isinstance(pricing.get('original'), int) and pricing.get('original') > 0 else None,
        discountPercent=pricing.get('discountPercent'),
        installment=pricing.get('installment'),
        thumbnail=media.get('thumbnail'),
        ratingAverage=rating.get('average'),
        ratingCount=rating.get('count'),
        ramGiB=capacity(specs.get('ram'), False),
        storageGiB=capacity(specs.get('storage'), True),
        weightKg=float(weight[1].replace(',', '.')) if weight else None,
        observedAt=(product.get('metadata') or {}).get('crawledAt') or document['generatedAt'],
        specs=specs,
    )
    rows.append({k: v for k, v in row.items() if v is not None or k in ('price', 'ramGiB', 'storageGiB', 'weightKg')})

extra = (root / 'data/manufacturer-device-references.json').read_bytes()
rows.extend(json.loads(extra))
raw += extra
assert len({r['id'] for r in rows}) == len(rows), 'Duplicate source-listing identity'
seed = dict(
    version=hashlib.sha256(raw).hexdigest()[:16],
    generatedAt=max(r['observedAt'] for r in rows),
    rows=rows,
)
target = root / 'apps/adviser/src/reference-seed.json'
target.write_text(json.dumps(seed, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(f'Normalized {len(rows)} records; version {seed["version"]}.')
