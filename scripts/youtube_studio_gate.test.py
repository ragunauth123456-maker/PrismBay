import hashlib
import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch
from youtube_studio_gate import CHANNEL, require_gate, assert_studio_tab, assert_current_metadata

class FakeTab:
    _kwargs = {"url": "https://studio.youtube.com/channel/" + CHANNEL + "/videos/upload"}
    class Runtime:
        @staticmethod
        def evaluate(**kwargs):
            return {"result": {"value": {"title": "AI vendor risk checklist",
                "description": "An original AI procurement lesson"}}}

class GateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.media = root / "original.mp4"
        self.media.write_bytes(b"test video bytes")
        self.receipt_path = root / "approval.json"
        self.env = patch.dict(os.environ, {"PRISMBAY_STUDIO_RECEIPT": str(self.receipt_path)})
        self.env.start()
        self.addCleanup(self.env.stop)
        self.now = datetime.now(timezone.utc)
        self.receipt = {"verified": True, "channelId": CHANNEL,
            "title": "AI vendor risk checklist", "description": "An original AI procurement lesson",
            "mediaPath": str(self.media), "mediaSha256": hashlib.sha256(self.media.read_bytes()).hexdigest(),
            "createdAt": self.now.isoformat(),
            "expiresAt": (self.now + timedelta(minutes=10)).isoformat()}
    def save(self):
        self.receipt_path.write_text(json.dumps(self.receipt), encoding="utf-8")
    def test_missing_receipt_fails_closed(self):
        with self.assertRaises(RuntimeError): require_gate("publish")
    def test_valid_receipt_and_media(self):
        self.save()
        self.assertEqual(require_gate("attach", str(self.media))["title"], self.receipt["title"])
    def test_wrong_channel_and_expiry(self):
        self.receipt["channelId"] = "incorrect"
        self.save()
        with self.assertRaises(RuntimeError): require_gate("publish")
        self.receipt["channelId"] = CHANNEL
        self.receipt["expiresAt"] = (self.now-timedelta(minutes=1)).isoformat()
        self.save()
        with self.assertRaises(RuntimeError): require_gate("publish")
    def test_mutated_media_and_wrong_file(self):
        self.save()
        with self.assertRaises(RuntimeError): require_gate("attach", str(self.media.parent / "wrong.mp4"))
        self.media.write_bytes(b"tampered")
        with self.assertRaises(RuntimeError): require_gate("publish")
    def test_exact_tab_and_visible_metadata(self):
        self.save()
        tab=FakeTab()
        assert_studio_tab(tab)
        assert_current_metadata(tab, require_gate("publish"))
        tab._kwargs={"url": "https://studio.youtube.com/channel/wrong"}
        with self.assertRaises(RuntimeError): assert_studio_tab(tab)

if __name__ == "__main__":
    unittest.main()
