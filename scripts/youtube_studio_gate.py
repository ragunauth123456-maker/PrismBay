"""Fail-closed publishing gate for the authorized PrismBay AI Studio profile."""
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

CHANNEL = "UCw2hs85TzIpdKwJtG-BSxzQ"

def require_gate(stage, media_path=None):
    location = Path(os.environ.get(
        "PRISMBAY_STUDIO_RECEIPT",
        str(Path(__file__).resolve().parent / ".publish-gate" / "approval.json")))
    if not location.is_file():
        raise RuntimeError("YouTube publication blocked: fresh verified preflight receipt missing")
    receipt = json.loads(location.read_text(encoding="utf-8"))
    if not receipt.get("verified") or receipt.get("channelId") != CHANNEL:
        raise RuntimeError("YouTube publication blocked: channel identity unverified")
    created = datetime.fromisoformat(receipt["createdAt"].replace("Z", "+00:00"))
    expires = datetime.fromisoformat(receipt["expiresAt"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    if not (created <= now < expires) or (expires-created).total_seconds() > 900:
        raise RuntimeError("YouTube publication blocked: receipt expired or invalid")
    path = Path(receipt["mediaPath"]).resolve(strict=True)
    if not path.is_file():
        raise RuntimeError("YouTube publication blocked: approved media missing")
    if media_path:
        try:
            attempted = Path(media_path).resolve(strict=True)
        except OSError as error:
            raise RuntimeError("YouTube publication blocked: attempted media unavailable") from error
        if attempted != path:
            raise RuntimeError("YouTube publication blocked: attempted media differs from approved")
    with path.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    if digest != receipt.get("mediaSha256"):
        raise RuntimeError("YouTube publication blocked: media checksum mismatch")
    if not receipt.get("title", "").strip() or not receipt.get("description", "").strip():
        raise RuntimeError("YouTube publication blocked: approved metadata incomplete")
    return receipt

def assert_studio_tab(tab):
    url = urlparse(tab._kwargs.get("url", ""))
    segments = url.path.split("/")
    if url.scheme != "https" or url.hostname != "studio.youtube.com" or len(segments) < 3 or segments[1:3] != ["channel", CHANNEL]:
        raise RuntimeError("YouTube publication blocked: wrong Studio channel")

def assert_current_metadata(tab, receipt):
    expression = """(() => ({
        title: document.querySelector('#title-textarea #textbox')?.innerText || '',
        description: document.querySelector('#description-textarea #textbox')?.innerText || ''
    }))()"""
    values = tab.Runtime.evaluate(expression=expression, returnByValue=True)
    actual = values.get("result", {}).get("value") or {}
    normalize = lambda s: " ".join(str(s).split())
    if (normalize(actual.get("title")) != normalize(receipt["title"]) or
            normalize(actual.get("description")) != normalize(receipt["description"])):
        raise RuntimeError("YouTube publication blocked: visible Studio metadata mismatch")
