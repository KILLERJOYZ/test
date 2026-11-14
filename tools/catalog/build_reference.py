"""Build the inspectable reference database using the app's exact SQL schema/seed."""
from pathlib import Path
import hashlib
import json
import sqlite3

root = Path(__file__).resolve().parents[2]
app = root / 'apps/adviser'
seed = json.loads((app / 'src/reference-seed.json').read_text(encoding='utf-8'))
source_hash = hashlib.sha256(
    (root / 'data/all_laptops_normalized.json').read_bytes()
    + (root / 'data/manufacturer-device-references.json').read_bytes()
).hexdigest()
assert seed['version'] == source_hash[:16], 'Seed/source mismatch; regenerate normalized seed before publication.'
schema = json.loads((app / 'src/reference-schema.json').read_text(encoding='utf-8'))['sql']
target = app / 'artifacts/lua-reference.sqlite'
target.parent.mkdir(exist_ok=True)
if target.exists():
    target.unlink()
db = sqlite3.connect(target)
db.executescript(schema)
with db:
    db.execute('DELETE FROM reference_fact')
    db.execute('DELETE FROM reference_offer')
    db.execute('DELETE FROM reference_listing')
    db.execute('DELETE FROM reference_source')
    db.executemany('INSERT INTO reference_source VALUES (?)', [(s,) for s in sorted({r['source'] for r in seed['rows']})])
    for r in seed['rows']:
        db.execute(
            'INSERT INTO reference_listing(id,source_id,name,condition,raw_json,category,price_vnd) VALUES (?,?,?,?,?,?,?)',
            (
                r['id'],
                r['source'],
                r['name'],
                r['condition'],
                json.dumps(r, ensure_ascii=False),
                r.get('category') or 'laptop',
                r['price'],
            ),
        )
        db.execute('INSERT INTO reference_offer VALUES (?,?,?,?)', (r['id'], r['price'], r['observedAt'], r['url']))
        db.executemany(
            'INSERT INTO reference_fact VALUES (?,?,?)',
            [(r['id'], k, json.dumps(v, ensure_ascii=False)) for k, v in r['specs'].items() if v is not None],
        )
    db.execute(
        'INSERT INTO reference_meta VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
        ('version', seed['version']),
    )
assert db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
assert not db.execute('PRAGMA foreign_key_check').fetchall()
assert db.execute('SELECT count(*) FROM reference_listing').fetchone()[0] == len(seed['rows'])
assert db.execute('SELECT count(*) FROM reference_offer').fetchone()[0] == len(seed['rows'])
assert db.execute('SELECT count(*) FROM reference_source').fetchone()[0] == len({r['source'] for r in seed['rows']})
before = db.execute('SELECT sum(price_vnd) FROM reference_offer').fetchone()[0]
try:
    with db:
        db.execute('UPDATE reference_offer SET price_vnd=price_vnd+1 WHERE price_vnd IS NOT NULL')
        db.execute('UPDATE reference_offer SET price_vnd=-1')
except sqlite3.IntegrityError:
    pass
else:
    raise AssertionError('Negative price accepted')
assert before == db.execute('SELECT sum(price_vnd) FROM reference_offer').fetchone()[0], 'Import failure did not roll back'
db.execute('PRAGMA wal_checkpoint(TRUNCATE)')
db.close()
report = {
    'version': seed['version'],
    'sourceSha256': source_hash,
    'rows': len(seed['rows']),
    'sources': len({r['source'] for r in seed['rows']}),
    'integrity': 'ok',
    'foreignKeys': 'ok',
    'negativePriceRejection': 'passed',
    'transactionRollback': 'passed',
    'database': str(target.relative_to(root)),
    'databaseSha256': hashlib.sha256(target.read_bytes()).hexdigest(),
    'mode': 'collected reference observations; not currently verified offers',
}
(app / 'verification/reference-database.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
