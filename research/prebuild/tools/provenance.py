"""Shared deterministic provenance and resume utilities."""
import hashlib, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
def file_hash(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def definition(task):
    return digest({k: task.get(k) for k in ('id','order','requiresArtifacts','reads','outputs','steps','requiredCommands','conditionalCommands','requiredUnitPacks','acceptance')})
def contained(root, ref):
    if not isinstance(ref,str) or not ref or ':' in ref or '\\' in ref or '..' in Path(ref).parts:
        raise ValueError('unsafe repository path')
    path = (Path(root) / ref).resolve()
    if not path.is_relative_to(Path(root).resolve()): raise ValueError('path outside root')
    return path
def defaults(existing, proposed):
    for key,value in proposed.items():
        if key not in existing: existing[key] = value
        elif isinstance(value,dict) and isinstance(existing[key],dict): defaults(existing[key],value)
    return existing
