"""
DOOLIA Printables — local color PNG → line art + A4 300DPI PDF → Cloudflare R2 → Supabase.

Filename convention (input_images/):
  {title}__{category}__{tag1}_{tag2}.png
  example: happy-lion__coloring__animal_lion.png

Optional sidecar JSON next to the PNG:
  {
    "title": "햇살 사자",
    "category": "coloring",
    "tags": ["동물", "사자"]
  }
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import quote

import boto3
import cv2
import numpy as np
from botocore.config import Config
from dotenv import load_dotenv
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from supabase import create_client

SCRIPT_DIR = Path(__file__).resolve().parent
INPUT_DIR = SCRIPT_DIR / "input_images"
OUTPUT_DIR = SCRIPT_DIR / "output"

DPI = 300
A4_MM = (210.0, 297.0)
A4_PX = (
    int(A4_MM[0] / 25.4 * DPI),  # 2480
    int(A4_MM[1] / 25.4 * DPI),  # 3508
)
ALLOWED_CATEGORIES = {"coloring", "maze", "tracing", "alphabet", "numbers"}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
WATERMARK = "© DOOLIA Printables"

logger = logging.getLogger("doolia")


@dataclass(frozen=True)
class PrintableMeta:
    title: str
    category: str
    tags: list[str]
    slug: str


def utf8_text(value: object) -> str:
    if isinstance(value, bytes):
        return value.decode("utf-8")
    text = str(value)
    return text.encode("utf-8").decode("utf-8")


def slugify(value: str) -> str:
    """ASCII slug for R2 keys and local output folders: a-z, 0-9, hyphen only."""
    normalized = unicodedata.normalize("NFKD", utf8_text(value).strip().lower())
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text)
    return ascii_text.strip("-")


def ascii_slug(*candidates: str) -> str:
    for candidate in candidates:
        slug = slugify(candidate)
        if slug:
            return slug
    return "printable"


def parse_filename(path: Path) -> PrintableMeta:
    stem = path.stem
    file_slug_source = stem.split("__")[0]
    sidecar = path.with_suffix(".json")
    if sidecar.exists():
        payload = json.loads(sidecar.read_text(encoding="utf-8-sig"))
        title = utf8_text(payload.get("title") or file_slug_source.replace("-", " "))
        category = utf8_text(payload.get("category") or "coloring").lower()
        tags = [utf8_text(tag) for tag in payload.get("tags", [])]
        return PrintableMeta(
            title=title,
            category=category,
            tags=tags,
            slug=ascii_slug(file_slug_source, stem),
        )

    parts = stem.split("__")
    title = utf8_text(parts[0].replace("-", " ").replace("_", " ").strip().title())
    category = utf8_text(parts[1]).lower() if len(parts) > 1 else "coloring"
    tags: list[str] = []
    if len(parts) > 2:
        tags = [utf8_text(tag) for tag in parts[2].replace("-", "_").split("_") if tag]
    return PrintableMeta(
        title=title,
        category=category,
        tags=tags,
        slug=ascii_slug(file_slug_source, stem),
    )


def configure_utf8_stdio() -> None:
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    if sys.platform == "win32":
        os.environ.setdefault("PYTHONUTF8", "1")
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is None:
            continue
        try:
            reconfigure(encoding="utf-8", errors="replace")
        except (OSError, ValueError):
            pass


def load_env() -> None:
    load_dotenv(SCRIPT_DIR / ".env")
    load_dotenv(SCRIPT_DIR.parent / ".env")
    aliases = {
        "SUPABASE_SERVICE_ROLE_KEY": "SUPABASE_SERVICE_KEY",
        "R2_PUBLIC_BASE_URL": "VITE_R2_PUBLIC_BASE_URL",
        "SUPABASE_URL": "VITE_SUPABASE_URL",
    }
    for canonical, alias in aliases.items():
        if not os.getenv(canonical) and os.getenv(alias):
            os.environ[canonical] = os.getenv(alias, "")


def require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def read_image(path: Path) -> np.ndarray:
    data = np.fromfile(path, dtype=np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"Cannot read image: {path}")
    return image


def write_png(path: Path, image_bgr: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    Image.fromarray(rgb).save(path, format="PNG", optimize=True)


def fit_to_a4(image_bgr: np.ndarray) -> np.ndarray:
    canvas_w, canvas_h = A4_PX
    height, width = image_bgr.shape[:2]
    scale = min(canvas_w / width, canvas_h / height)
    new_w = max(1, int(width * scale))
    new_h = max(1, int(height * scale))
    resized = cv2.resize(image_bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)
    canvas_img = np.full((canvas_h, canvas_w, 3), 255, dtype=np.uint8)
    x = (canvas_w - new_w) // 2
    y = (canvas_h - new_h) // 2
    canvas_img[y : y + new_h, x : x + new_w] = resized
    return canvas_img


def to_line_art(image_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    smooth = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
    line = cv2.adaptiveThreshold(
        smooth,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        15,
        4,
    )
    kernel = np.ones((2, 2), np.uint8)
    line = cv2.morphologyEx(line, cv2.MORPH_OPEN, kernel)
    return cv2.cvtColor(line, cv2.COLOR_GRAY2BGR)


def build_pdf(line_art_path: Path, pdf_path: Path, title: str) -> None:
    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    page_w, page_h = A4
    margin = 12 * mm
    footer_h = 14 * mm

    pdf = canvas.Canvas(str(pdf_path), pagesize=A4)
    pdf.setTitle(slugify(title) or "doolia-printable")
    pdf.setAuthor("DOOLIA Printables")
    pdf.setSubject("Free A4 printable — Print, Play & Discover")

    image_width = page_w - (margin * 2)
    image_height = page_h - (margin * 2) - footer_h
    pdf.drawImage(
        ImageReader(str(line_art_path)),
        margin,
        margin + footer_h,
        width=image_width,
        height=image_height,
        preserveAspectRatio=True,
        anchor="c",
        mask="auto",
    )

    pdf.setFillColorRGB(0.35, 0.32, 0.28)
    pdf.setFont("Helvetica", 9)
    pdf.drawCentredString(page_w / 2, 8 * mm, WATERMARK)
    pdf.save()


def r2_client():
    account_id = require_env("R2_ACCOUNT_ID")
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=require_env("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=require_env("R2_SECRET_ACCESS_KEY"),
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def content_disposition(filename: str, title: str, extension: str) -> str:
    ascii_name = f"{slugify(filename) or 'printable'}{extension}"
    utf8_name = f"{utf8_text(title)}{extension}"
    return (
        f'inline; filename="{ascii_name}"; '
        f"filename*=UTF-8''{quote(utf8_name, safe='')}"
    )


def upload_file(
    client: Any,
    bucket: str,
    key: str,
    path: Path,
    content_type: str,
    title: str,
) -> None:
    extension = Path(key).suffix
    extra = {
        "ContentType": content_type,
        "CacheControl": "public, max-age=31536000, immutable",
        "ContentDisposition": content_disposition(Path(key).stem, title, extension),
        "Metadata": {"title": quote(utf8_text(title), safe="")},
    }
    client.upload_file(str(path), bucket, key, ExtraArgs=extra)
    logger.info("Uploaded s3://%s/%s", bucket, key)


def public_url(base: str, key: str) -> str:
    encoded_key = "/".join(quote(segment, safe="-._~") for segment in key.split("/"))
    return f"{base.rstrip('/')}/{encoded_key}"


def process_one(path: Path, dry_run: bool) -> None:
    meta = parse_filename(path)
    if meta.category not in ALLOWED_CATEGORIES:
        raise ValueError(f"Unsupported category '{meta.category}' for {path.name}")

    logger.info(
        "Processing %s -> title=%s slug=%s [%s]",
        path.name,
        meta.title,
        meta.slug,
        meta.category,
    )
    color_a4 = fit_to_a4(read_image(path))
    line_a4 = to_line_art(color_a4)

    work_dir = OUTPUT_DIR / meta.slug
    color_path = work_dir / "color.png"
    line_path = work_dir / "line-art.png"
    pdf_path = work_dir / "printable.pdf"

    write_png(color_path, color_a4)
    write_png(line_path, line_a4)
    build_pdf(line_path, pdf_path, meta.title)

    if dry_run:
        logger.info("Dry run — skipped R2 upload and Supabase insert for %s", meta.slug)
        return

    bucket = require_env("R2_BUCKET_NAME")
    public_base = require_env("R2_PUBLIC_BASE_URL")
    client = r2_client()
    prefix = f"printables/{meta.slug}"
    keys = {
        "color": f"{prefix}/color.png",
        "line": f"{prefix}/line-art.png",
        "pdf": f"{prefix}/printable.pdf",
    }
    upload_file(client, bucket, keys["color"], color_path, "image/png", meta.title)
    upload_file(client, bucket, keys["line"], line_path, "image/png", meta.title)
    upload_file(client, bucket, keys["pdf"], pdf_path, "application/pdf", meta.title)

    supabase = create_client(require_env("SUPABASE_URL"), require_env("SUPABASE_SERVICE_ROLE_KEY"))
    row = {
        "title": utf8_text(meta.title),
        "category": utf8_text(meta.category),
        "tags": [utf8_text(tag) for tag in meta.tags],
        "color_image_url": public_url(public_base, keys["color"]),
        "line_art_url": public_url(public_base, keys["line"]),
        "pdf_url": public_url(public_base, keys["pdf"]),
    }
    payload = json.loads(json.dumps(row, ensure_ascii=False))
    response = supabase.table("printables").insert(payload).execute()
    inserted = response.data[0] if response.data else {}
    saved_title = utf8_text(inserted.get("title") or meta.title)
    logger.info("Inserted printable id=%s title=%s slug=%s", inserted.get("id"), saved_title, meta.slug)


def iter_inputs() -> list[Path]:
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    files = [
        path
        for path in sorted(INPUT_DIR.iterdir())
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS
    ]
    if not files:
        raise FileNotFoundError(
            f"No images found in {INPUT_DIR}. Put color PNGs there first "
            "(example: happy-lion__coloring__animal_lion.png)."
        )
    return files


def main() -> int:
    configure_utf8_stdio()
    load_env()
    parser = argparse.ArgumentParser(description="DOOLIA Printables asset pipeline")
    parser.add_argument("--dry-run", action="store_true", help="Generate local files only")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s %(message)s",
        encoding="utf-8",
        force=True,
    )

    try:
        for image_path in iter_inputs():
            process_one(image_path, dry_run=args.dry_run)
    except Exception as exc:  # noqa: BLE001 — CLI exit with a clear message
        logger.error("%s", exc)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
