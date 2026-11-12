"""Explainer that speaks the OpenAI Responses API. Default host is xAI."""

from __future__ import annotations

import json
import os
import re
from typing import Any

SYSTEM_PROMPT = """Bạn giải thích một danh sách laptop đã được catalog chọn sẵn.
Chỉ dùng variant_id, evidence_id và amount_vnd có trong gói người dùng gửi.
Giá là giá niêm yết, không phải tổng đã đối soát, không phải giá rẻ nhất thị trường.
Không bịa mẫu máy, đường link, nguồn hoặc số tiền.
Trả về đúng một JSON object với các khóa text, variant_ids, evidence_ids, amounts_vnd.
Không markdown."""


class OpenAIResponsesExplainer:
    def __init__(self, client: Any, model: str) -> None:
        self.client = client
        self.model = model

    def explain(self, packet: dict[str, Any]) -> dict[str, Any]:
        response = self.client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps(_compact(packet), ensure_ascii=False)},
            ],
            store=False,
        )
        return parse_model_json(response.output_text)

    @classmethod
    def from_env(cls) -> "OpenAIResponsesExplainer | None":
        key = os.getenv("XAI_API_KEY", "").strip()
        if not key:
            return None
        import httpx
        from openai import OpenAI

        timeout_s = float(os.getenv("XAI_TIMEOUT_S", "8"))
        client = OpenAI(
            api_key=key,
            base_url=os.getenv("XAI_BASE_URL", "https://api.x.ai/v1"),
            timeout=httpx.Timeout(timeout_s),
        )
        return cls(client, os.getenv("XAI_MODEL", "grok-4.7"))


def parse_model_json(raw: str) -> dict[str, Any]:
    text = raw.strip()
    fenced = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, flags=re.DOTALL)
    if fenced:
        text = fenced.group(1).strip()
    data = json.loads(text)
    if not isinstance(data, dict):
        raise TypeError("model JSON is not an object")
    return data


def _compact(packet: dict[str, Any]) -> dict[str, Any]:
    return {
        "request": packet.get("request"),
        "offers": [
            {
                "variant_id": row["variant_id"],
                "name": row["name"],
                "seller": row["seller"],
                "amount_vnd": row["amount_vnd"],
                "completeness": row["completeness"],
            }
            for row in packet.get("offers") or []
        ],
        "evidence": [
            {
                "evidence_id": row["evidence_id"],
                "variant_id": row["variant_id"],
                "source_label": row["source_label"],
                "claim": row["claim"],
            }
            for row in packet.get("evidence") or []
        ],
    }
