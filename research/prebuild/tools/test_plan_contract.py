"""UPLAN: real specification guard tests, independent of future research execution."""
from copy import deepcopy
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from plan_contracts import load_repository_spec, validate_spec


def fixture():
    tracker = {
        "planVersion": "test",
        "tasks": [{"id": "R00", "requiresArtifacts": [],
                   "outputs": ["tests/test_unit.py"], "requiredUnitPacks": ["U00"],
                   "requiredCommands": ["unit"]}],
        "commands": {"unit": {"level": "unit", "createdBy": "R00"}},
    }
    catalog = {
        "planVersion": "test",
        "packs": [{"id": "U00", "level": "unit", "availability": "to_implement",
                   "createdByTask": "R00", "testFiles": ["tests/test_unit.py"],
                   "commandIds": ["unit"],
                   "cases": [{"id": "U00-01", "given": "fixed input",
                              "when": "validate", "then": "accept", "required": True}]}],
        "nonUnitChecks": [],
    }
    return tracker, catalog


class PlanContractTests(unittest.TestCase):
    def test_UPLAN_01_accept_valid_minimal_contract(self):
        self.assertEqual(validate_spec(*fixture()), [])

    def test_UPLAN_02_missing_or_unknown_task_pack(self):
        for packs in ([], ["UNKNOWN"]):
            with self.subTest(packs=packs):
                tracker, catalog = fixture()
                tracker["tasks"][0]["requiredUnitPacks"] = packs
                self.assertTrue(validate_spec(tracker, catalog))

    def test_UPLAN_03_integration_command_cannot_be_unit(self):
        tracker, catalog = fixture()
        tracker["commands"]["unit"]["level"] = "integration"
        self.assertTrue(any("not unit" in e for e in validate_spec(tracker, catalog)))

    def test_UPLAN_04_missing_command_or_undeclared_planned_file(self):
        for field in ("commands", "outputs"):
            with self.subTest(field=field):
                tracker, catalog = fixture()
                if field == "commands":
                    tracker["commands"] = {}
                else:
                    tracker["tasks"][0]["outputs"] = []
                self.assertTrue(validate_spec(tracker, catalog))

    def test_UPLAN_05_cycle_or_pack_created_after_consumer(self):
        tracker, catalog = fixture()
        tracker["tasks"].append({
            "id": "R01", "requiresArtifacts": ["R00"], "outputs": ["tests/test_unit.py"],
            "requiredUnitPacks": ["U00"], "requiredCommands": ["unit"],
        })
        tracker["tasks"][0]["requiresArtifacts"] = ["R01"]
        self.assertTrue(any("cycle" in e for e in validate_spec(tracker, catalog)))
        tracker["tasks"][0]["requiresArtifacts"] = []
        catalog["packs"][0]["createdByTask"] = "R01"
        self.assertTrue(any("after consumer" in e for e in validate_spec(tracker, catalog)))
        catalog["packs"][0]["createdByTask"] = "R00"
        tracker["commands"]["unit"]["createdBy"] = "R01"
        self.assertTrue(any("command unit created after consumer" in e
                            for e in validate_spec(tracker, catalog)))

    def test_UPLAN_06_case_ids_and_expected_outcomes_required(self):
        for defect in ("duplicate", "empty", "missing_then"):
            with self.subTest(defect=defect):
                tracker, catalog = fixture()
                cases = catalog["packs"][0]["cases"]
                if defect == "duplicate":
                    cases.append(deepcopy(cases[0]))
                elif defect == "empty":
                    cases[0]["id"] = ""
                else:
                    del cases[0]["then"]
                self.assertTrue(validate_spec(tracker, catalog))

    def test_UPLAN_07_paths_cannot_escape_repository(self):
        for path in ("../outside.py", "/absolute.py", "C:/outside.py", "tests/../../x.py"):
            with self.subTest(path=path):
                tracker, catalog = fixture()
                catalog["packs"][0]["testFiles"] = [path]
                self.assertTrue(any("unsafe" in e for e in validate_spec(tracker, catalog)))

    def test_UPLAN_08_nonunit_and_command_ownership_are_validated(self):
        tracker, catalog = fixture()
        catalog["nonUnitChecks"] = [
            {"id": "HTTP", "level": "integration", "commandIds": ["unit"]},
        ]
        tracker["commands"]["unit"]["createdBy"] = "UNKNOWN"
        errors = validate_spec(tracker, catalog)
        self.assertTrue(any("non-unit command" in e for e in errors))
        self.assertTrue(any("unknown command owner" in e for e in errors))
        catalog["changeImpact"] = [{"unitPacks": ["ABSENT"], "nonUnit": ["ABSENT"]}]
        errors = validate_spec(tracker, catalog)
        self.assertTrue(any("unknown pack ABSENT" in e for e in errors))
        self.assertTrue(any("unknown check ABSENT" in e for e in errors))

    def test_UPLAN_09_actual_repository_manifests_are_consistent(self):
        root = Path(__file__).resolve().parents[3]
        self.assertEqual(validate_spec(*load_repository_spec(root), repo_root=root), [])

    def test_UPLAN_10_existing_pack_requires_real_test_file(self):
        tracker, catalog = fixture()
        catalog["packs"][0]["availability"] = "existing"
        with TemporaryDirectory() as root:
            self.assertTrue(any("existing test file missing" in e
                                for e in validate_spec(tracker, catalog, root)))
            path = Path(root) / "tests/test_unit.py"
            path.parent.mkdir()
            path.write_text("# isolated fixture", encoding="utf-8")
            self.assertEqual(validate_spec(tracker, catalog, root), [])


if __name__ == "__main__":
    unittest.main()
