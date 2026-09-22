"""Package only extension runtime files; no user data or development fixtures."""
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "manifest.json").read_text())
package = json.loads((root / "package.json").read_text())
assert package["version"] == manifest["version"], "Version mismatch"
files = [
    "manifest.json", "adapters.js", "background.js", "content.js", "core.js",
    "platforms.js", "transport.js", "i18n.js", "presets.js", "config.js", "options.html", "options.js", "options.css",
    "popup.html", "popup.js", "privacy.html", "privacy.js", "LICENSE", "NOTICE",
    *manifest["icons"].values(),
    *[str(path.relative_to(root)) for path in sorted((root / "_locales").glob("*/messages.json"))],
]
referenced = [manifest["background"]["service_worker"], manifest["options_page"],
              manifest["action"]["default_popup"], *manifest["action"]["default_icon"].values()]
for entry in manifest["content_scripts"]:
    referenced.extend(entry["js"])
assert set(referenced).issubset(files), "Manifest references unpackaged files"
destination = root / "dist" / f'feed-lens-{manifest["version"]}.zip'
destination.parent.mkdir(exist_ok=True)
with ZipFile(destination, "w", compression=ZIP_DEFLATED) as archive:
    for name in sorted(set(files)):
        info = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, (root / name).read_bytes())
with ZipFile(destination) as archive:
    assert archive.testzip() is None
    assert "manifest.json" in archive.namelist()
digest = hashlib.sha256(destination.read_bytes()).hexdigest()
destination.with_suffix(".sha256").write_text(f"{digest}  {destination.name}\n")
print(f"{destination.name}: {len(set(files))} files, {destination.stat().st_size} bytes")
print(f"SHA-256: {digest}")
