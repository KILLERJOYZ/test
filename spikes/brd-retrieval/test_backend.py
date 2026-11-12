"""OpenAI-shaped explainer parsing and the local backend, without a live model call."""

from __future__ import annotations

import json
import sys
import threading
from http.server import ThreadingHTTPServer
from urllib.request import Request, urlopen

import psycopg

from agent_flow import advise
from explorer import DEFAULT_QDRANT, DEFAULT_URL
from flow import open_qdrant_server
from openai_explainer import OpenAIResponsesExplainer, parse_model_json
from server import make_handler

KNOWN_PRICE = 26_990_000


def check(name: str, ok: bool, detail: str) -> bool:
    print(f"{'PASS' if ok else 'FAIL'} {name}: {detail}")
    return ok


class FakeResponse:
    def __init__(self, text: str) -> None:
        self.output_text = text


class FakeResponses:
    def __init__(self, text: str) -> None:
        self.text = text

    def create(self, **kwargs):
        self.kwargs = kwargs
        return FakeResponse(self.text)


class FakeClient:
    def __init__(self, text: str) -> None:
        self.responses = FakeResponses(text)


def post_json(base: str, path: str, payload: dict) -> tuple[int, dict]:
    request = Request(
        base + path,
        data=json.dumps(payload).encode("utf-8"),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urlopen(request) as response:
        return response.status, json.loads(response.read().decode("utf-8"))


def main() -> int:
    parsed = parse_model_json('```json\n{"text":"ok","variant_ids":["a"]}\n```')
    passed = check("parse", parsed["text"] == "ok" and parsed["variant_ids"] == ["a"], str(parsed))

    client = FakeClient(
        json.dumps(
            {
                "text": f"Niêm yết {KNOWN_PRICE} VND.",
                "variant_ids": ["7f2f820acd4a84f3"],
                "evidence_ids": [],
                "amounts_vnd": [KNOWN_PRICE],
            }
        )
    )
    explainer = OpenAIResponsesExplainer(client, "grok-4.7")
    qdrant = open_qdrant_server(DEFAULT_QDRANT)
    with psycopg.connect(DEFAULT_URL) as conn:
        live = advise(conn, qdrant, "LOQ 83Y9003VVN dưới 30 triệu", explainer=explainer)
    passed = check(
        "responses-call",
        live["mode"] == "live"
        and client.responses.kwargs["model"] == "grok-4.7"
        and client.responses.kwargs["store"] is False
        and client.responses.kwargs["input"][0]["role"] == "system",
        live["mode"],
    ) and passed

    bad = OpenAIResponsesExplainer(
        FakeClient(json.dumps({"text": "Giá 88888888", "variant_ids": ["7f2f820acd4a84f3"], "evidence_ids": [], "amounts_vnd": []})),
        "grok-4.7",
    )
    with psycopg.connect(DEFAULT_URL) as conn:
        rejected = advise(conn, qdrant, "LOQ 83Y9003VVN dưới 30 triệu", explainer=bad)
    passed = check("responses-reject", rejected["reason"] == "invalid_output", rejected["reason"]) and passed

    def ask(request: str) -> dict:
        return {"mode": "fallback", "reason": "provider_unavailable", "answer": request, "offers": [], "evidence": []}

    def health() -> dict:
        return {"catalog": "ok", "evidence": "ok", "provider_configured": False, "model": "grok-4.7"}

    httpd = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(ask, health))
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    host, port = httpd.server_address
    base = f"http://{host}:{port}"
    try:
        with urlopen(base + "/") as page:
            html = page.read().decode("utf-8")
        with urlopen(base + "/api/health") as status:
            body = json.loads(status.read().decode("utf-8"))
        code, advised = post_json(base, "/api/advise", {"request": "LOQ dưới 30 triệu"})
        passed = check(
            "backend",
            code == 200
            and "Tra cứu catalog" in html
            and body["provider_configured"] is False
            and advised["answer"] == "LOQ dưới 30 triệu"
            and advised["mode"] == "fallback",
            advised["mode"],
        ) and passed
    finally:
        httpd.shutdown()
    print("RESULT PASS" if passed else "RESULT FAIL")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
