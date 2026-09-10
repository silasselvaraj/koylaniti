import json

import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "qwen2.5:0.5b"


def call_ollama(prompt: str, timeout: int = 60) -> dict:
    """POSTs to the local Ollama server, forces JSON output, returns the parsed dict.
    Raises RuntimeError (never a raw requests/json exception) on any failure so callers
    can catch one exception type."""
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.1},
    }
    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=timeout)
        resp.raise_for_status()
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError("Could not reach Ollama at localhost:11434. Is it running?") from e
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Ollama request failed: {e}") from e

    raw_output = resp.json().get("response", "")
    try:
        return json.loads(raw_output)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Model did not return valid JSON:\n{raw_output}") from e
