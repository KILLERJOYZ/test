"""Validate research-plan/test-pack links; does not execute research or accept gates."""
from pathlib import Path, PurePosixPath
import json


def validate_spec(tracker, catalog, repo_root=None):
    errors = []
    root = Path(repo_root).resolve() if repo_root is not None else None
    tasks = {t["id"]: t for t in tracker.get("tasks", [])}
    packs = {p["id"]: p for p in catalog.get("packs", [])}
    commands = tracker.get("commands", {})
    if len(tasks) != len(tracker.get("tasks", [])):
        errors.append("Duplicate task id")
    if len(packs) != len(catalog.get("packs", [])):
        errors.append("Duplicate pack id")
    if tracker.get("planVersion") != catalog.get("planVersion"):
        errors.append("Plan versions differ")

    def safe_path(value):
        if not isinstance(value, str) or not value or "\\" in value or ":" in value:
            return False
        path = PurePosixPath(value)
        if path.is_absolute() or ".." in path.parts:
            return False
        return root is None or (root / value).resolve().is_relative_to(root)

    ancestors = {}
    visiting = set()

    def visit(task_id):
        if task_id in ancestors:
            return ancestors[task_id]
        if task_id in visiting:
            errors.append(f"Dependency cycle at {task_id}")
            return set()
        visiting.add(task_id)
        result = set()
        for dep in tasks[task_id].get("requiresArtifacts", []):
            if dep not in tasks:
                errors.append(f"{task_id}: unknown dependency {dep}")
                continue
            result.add(dep)
            result.update(visit(dep))
        visiting.remove(task_id)
        ancestors[task_id] = result
        return result

    for task_id in tasks:
        visit(task_id)
    for command_id, command in commands.items():
        owner = command.get("createdBy")
        if owner is not None and owner not in tasks:
            errors.append(f"{command_id}: unknown command owner {owner}")

    seen_cases = set()
    for pack_id, pack in packs.items():
        if pack.get("level") != "unit":
            errors.append(f"{pack_id}: pack must be unit")
        owner = pack.get("createdByTask")
        if owner is not None and owner not in tasks:
            errors.append(f"{pack_id}: unknown pack owner {owner}")
        if pack.get("availability") not in ("existing", "to_implement"):
            errors.append(f"{pack_id}: invalid availability")
        if not pack.get("commandIds") or not pack.get("testFiles") or not pack.get("cases"):
            errors.append(f"{pack_id}: empty commands, files or cases")
        for command_id in pack.get("commandIds", []):
            command = commands.get(command_id)
            if command is None:
                errors.append(f"{pack_id}: unknown command {command_id}")
            elif command.get("level") != "unit":
                errors.append(f"{pack_id}: command {command_id} is not unit")
        for file in pack.get("testFiles", []):
            if not safe_path(file):
                errors.append(f"{pack_id}: unsafe test path {file}")
            elif pack.get("availability") == "existing":
                if root is not None and not (root / file).is_file():
                    errors.append(f"{pack_id}: existing test file missing: {file}")
            elif owner not in tasks or file not in tasks[owner].get("outputs", []):
                errors.append(f"{pack_id}: test file not declared by owner: {file}")
        for case in pack.get("cases", []):
            case_id = case.get("id")
            if not isinstance(case_id, str) or not case_id or case_id in seen_cases or not case_id.startswith(pack_id + "-"):
                errors.append(f"{pack_id}: invalid or duplicate case id {case_id}")
            seen_cases.add(case_id)
            for field in ("given", "when", "then"):
                if not isinstance(case.get(field), str) or not case[field].strip():
                    errors.append(f"{case_id}: missing {field}")
            if case.get("required") is not True:
                errors.append(f"{case_id}: required must be true")

    for task_id, task in tasks.items():
        selected = task.get("requiredUnitPacks", [])
        if not selected:
            errors.append(f"{task_id}: missing required unit packs")
        required = task.get("requiredCommands", [])
        for command_id in required + task.get("conditionalCommands", []):
            if command_id not in commands:
                errors.append(f"{task_id}: unknown command {command_id}")
            else:
                owner = commands[command_id].get("createdBy")
                if owner is not None and owner not in ({task_id} | ancestors[task_id]):
                    errors.append(f"{task_id}: command {command_id} created after consumer")
        for pack_id in selected:
            pack = packs.get(pack_id)
            if pack is None:
                errors.append(f"{task_id}: unknown pack {pack_id}")
                continue
            owner = pack.get("createdByTask")
            if pack.get("availability") == "to_implement" and owner not in ({task_id} | ancestors[task_id]):
                errors.append(f"{task_id}: pack {pack_id} created after consumer")
            for command_id in pack.get("commandIds", []):
                if command_id not in required:
                    errors.append(f"{task_id}: pack command not required: {command_id}")

    check_ids = set()
    for check in catalog.get("nonUnitChecks", []):
        check_id = check.get("id")
        if not check_id or check_id in check_ids or check_id in packs:
            errors.append(f"Invalid non-unit check id {check_id}")
        check_ids.add(check_id)
        if check.get("level") not in ("integration", "build", "device", "live"):
            errors.append(f"{check_id}: invalid non-unit level")
        for command_id in check.get("commandIds", []):
            command = commands.get(command_id)
            if command is None or command.get("level") != check.get("level"):
                errors.append(f"{check_id}: invalid non-unit command {command_id}")
    for rule in catalog.get("changeImpact", []):
        for pack_id in rule.get("unitPacks", []):
            if pack_id not in packs:
                errors.append(f"Change rule references unknown pack {pack_id}")
        for check_id in rule.get("nonUnit", []):
            if check_id not in check_ids:
                errors.append(f"Change rule references unknown check {check_id}")
    return errors


def load_repository_spec(repo_root):
    root = Path(repo_root)
    tracker = json.loads((root / "docs/planning/PREBUILD_RESEARCH_TRACKER.json").read_text(encoding="utf-8"))
    catalog = json.loads((root / "docs/planning/PREBUILD_TEST_PACKS.json").read_text(encoding="utf-8"))
    return tracker, catalog


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[3]
    findings = validate_spec(*load_repository_spec(root), repo_root=root)
    print("\n".join(findings) if findings else "Plan and unit-pack contracts are consistent.")
    raise SystemExit(bool(findings))
