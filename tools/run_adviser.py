"""Run the canonical API from any working directory."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
if "--prepare" in sys.argv:
    from backend.services.device_catalog import prepare_publisher

    prepare_publisher()
    print("Publisher prepared. Rebuild the app to include its public pin.")
else:
    import uvicorn
    from backend.config import API_HOST, API_PORT
    from backend.main import enforce_cli_auth_policy

    enforce_cli_auth_policy()
    uvicorn.run("backend.main:app", host=API_HOST, port=API_PORT)
