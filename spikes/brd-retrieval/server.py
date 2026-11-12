"""Local backend for one catalog question. The API key never leaves this process."""

from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlparse

import psycopg
from dotenv import load_dotenv

from agent_flow import DEFAULT_QDRANT, DEFAULT_URL, advise
from flow import open_qdrant_server
from openai_explainer import OpenAIResponsesExplainer

HERE = Path(__file__).resolve().parent
PAGE = (HERE / "static" / "index.html").read_text(encoding="utf-8")
HOST = "127.0.0.1"
PORT = 8787


def load_local_env() -> None:
    load_dotenv(HERE / ".env")


def make_handler(
    ask: Callable[[str], dict[str, Any]],
    health: Callable[[], dict[str, Any]],
) -> type[BaseHTTPRequestHandler]:
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:
            path = urlparse(self.path).path
            if path == "/":
                body = PAGE.encode("utf-8")
                self._send(200, "text/html; charset=utf-8", body)
                return
            if path == "/api/health":
                self._send_json(200, health())
                return
            self._send_json(404, {"error": "not found"})

        def do_POST(self) -> None:
            path = urlparse(self.path).path
            if path != "/api/advise":
                self._send_json(404, {"error": "not found"})
                return
            length = int(self.headers.get("content-length") or "0")
            if length > 8000:
                self._send_json(413, {"error": "request too large"})
                return
            try:
                payload = json.loads(self.rfile.read(length) or b"{}")
                request = str(payload.get("request") or "").strip()
            except (json.JSONDecodeError, UnicodeError):
                self._send_json(400, {"error": "invalid json"})
                return
            if not request:
                self._send_json(400, {"error": "request is empty"})
                return
            self._send_json(200, ask(request))

        def _send_json(self, status: int, payload: dict[str, Any]) -> None:
            self._send(status, "application/json; charset=utf-8", json.dumps(payload, ensure_ascii=False).encode("utf-8"))

        def _send(self, status: int, content_type: str, body: bytes) -> None:
            self.send_response(status)
            self.send_header("content-type", content_type)
            self.send_header("content-length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, fmt: str, *args: Any) -> None:
            return

    return Handler


def build_runtime() -> tuple[Callable[[str], dict[str, Any]], Callable[[], dict[str, Any]]]:
    database_url = os.getenv("DATABASE_URL", DEFAULT_URL)
    qdrant_url = os.getenv("QDRANT_URL", DEFAULT_QDRANT)
    explainer = OpenAIResponsesExplainer.from_env()
    client = open_qdrant_server(qdrant_url)

    def ask(request: str) -> dict[str, Any]:
        with psycopg.connect(database_url) as conn:
            return advise(conn, client, request, explainer=explainer)

    def health() -> dict[str, Any]:
        catalog = "down"
        evidence = "down"
        try:
            with psycopg.connect(database_url) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) FROM variants")
                    cur.fetchone()
            catalog = "ok"
        except Exception:
            catalog = "down"
        try:
            client.get_collections()
            evidence = "ok"
        except Exception:
            evidence = "down"
        return {
            "catalog": catalog,
            "evidence": evidence,
            "provider_configured": explainer is not None,
            "model": os.getenv("XAI_MODEL", "grok-4.7"),
        }

    return ask, health


def serve(host: str = HOST, port: int = PORT) -> None:
    load_local_env()
    ask, health = build_runtime()
    server = ThreadingHTTPServer((host, port), make_handler(ask, health))
    print(f"http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    serve()
