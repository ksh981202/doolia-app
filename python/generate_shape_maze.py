"""
DOOLIA Printables — 캐릭터 외곽선 안쪽에만 길을 뚫는 셰이프 미로 생성기.

유아용 큰 통로(18~22px) + 얼굴 보호 마스킹 + START/FINISH 표시 + A4 300DPI PDF.
"""

from __future__ import annotations

import argparse
import random
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

SCRIPT_DIR = Path(__file__).resolve().parent
DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
KOREAN_FONT_CANDIDATES = [
    Path(r"C:\Windows\Fonts\malgunbd.ttf"),
    Path(r"C:\Windows\Fonts\malgun.ttf"),
    Path(r"C:\Windows\Fonts\arialbd.ttf"),
]


def _read_gray(path: Path) -> np.ndarray:
    data = np.fromfile(path, dtype=np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError(f"Cannot read image: {path}")
    if image.ndim == 3 and image.shape[2] == 4:
        bgr = image[:, :, :3]
        alpha = image[:, :, 3] / 255.0
        white = np.full_like(bgr, 255)
        blended = (bgr * alpha[..., None] + white * (1.0 - alpha[..., None])).astype(np.uint8)
        return cv2.cvtColor(blended, cv2.COLOR_BGR2GRAY)
    if image.ndim == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image


def _write_png(path: Path, image: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ok, buf = cv2.imencode(".png", image)
    if not ok:
        raise ValueError(f"Cannot encode PNG: {path}")
    buf.tofile(str(path))


def extract_interior_mask(gray: np.ndarray, ink_threshold: int = 200) -> tuple[np.ndarray, np.ndarray]:
    _, paper = cv2.threshold(gray, ink_threshold, 255, cv2.THRESH_BINARY)
    outline = cv2.bitwise_not(paper)
    kernel = np.ones((5, 5), np.uint8)
    closed = cv2.morphologyEx(outline, cv2.MORPH_CLOSE, kernel, iterations=3)

    filled = cv2.bitwise_not(closed)
    height, width = filled.shape
    flood_mask = np.zeros((height + 2, width + 2), np.uint8)
    cv2.floodFill(filled, flood_mask, (0, 0), 0)
    interior = cv2.erode(filled, np.ones((3, 3), np.uint8), iterations=2)
    return outline, interior


def protect_face_mask(outline: np.ndarray, interior: np.ndarray) -> np.ndarray:
    """눈·코·입·귀·수염이 있는 머리 쪽은 미로를 그리지 않습니다."""
    ys, xs = np.where(interior > 0)
    if xs.size == 0:
        return np.zeros_like(interior)

    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    box_w = max(1, x1 - x0)
    box_h = max(1, y1 - y0)

    head = np.zeros_like(interior)
    head_x = x0 + int(box_w * 0.50)
    head_y = y0 + int(box_h * 0.62)
    head[y0:head_y, head_x : x1 + 1] = interior[y0:head_y, head_x : x1 + 1]
    head = cv2.dilate(head, np.ones((21, 21), np.uint8), iterations=1)

    eroded = cv2.erode(interior, np.ones((9, 9), np.uint8), iterations=2)
    inner_ink = cv2.bitwise_and(outline, eroded)
    inner_ink = cv2.dilate(inner_ink, np.ones((15, 15), np.uint8), iterations=2)

    protect = cv2.bitwise_or(head, inner_ink)
    return cv2.bitwise_and(protect, interior)


def maze_area_mask(interior: np.ndarray, face_protect: np.ndarray) -> np.ndarray:
    area = cv2.bitwise_and(interior, cv2.bitwise_not(face_protect))
    area = cv2.erode(area, np.ones((5, 5), np.uint8), iterations=1)
    if int((area > 0).sum()) < 500:
        raise ValueError("Maze area is too small after face protection.")
    return area


def _in_shape_cells(mask: np.ndarray, cell_size: int, margin: int) -> np.ndarray:
    height, width = mask.shape
    rows = max(1, (height - margin * 2) // cell_size)
    cols = max(1, (width - margin * 2) // cell_size)
    cells = np.zeros((rows, cols), dtype=bool)
    sample = cell_size // 3
    for row in range(rows):
        for col in range(cols):
            y = margin + row * cell_size + cell_size // 2
            x = margin + col * cell_size + cell_size // 2
            if y >= height or x >= width:
                continue
            patch = mask[
                max(0, y - sample) : min(height, y + sample),
                max(0, x - sample) : min(width, x + sample),
            ]
            cells[row, col] = patch.size > 0 and float((patch > 0).mean()) > 0.72
    if not cells.any():
        raise ValueError("Closed interior not found. Use a fully closed outline on a white background.")
    return cells


def _carve_maze(cells: np.ndarray, rng: random.Random) -> set[tuple[tuple[int, int], tuple[int, int]]]:
    rows, cols = cells.shape
    starts = [(r, c) for r in range(rows) for c in range(cols) if cells[r, c]]
    start = min(starts, key=lambda rc: (rc[1], rc[0]))
    visited = {start}
    stack = [start]
    passages: set[tuple[tuple[int, int], tuple[int, int]]] = set()

    while stack:
        row, col = stack[-1]
        neighbors = [
            (row + dr, col + dc)
            for dr, dc in DIRS
            if 0 <= row + dr < rows
            and 0 <= col + dc < cols
            and cells[row + dr, col + dc]
            and (row + dr, col + dc) not in visited
        ]
        if not neighbors:
            stack.pop()
            continue
        nxt = rng.choice(neighbors)
        visited.add(nxt)
        stack.append(nxt)
        passages.add(tuple(sorted(((row, col), nxt))))  # type: ignore[arg-type]

    leftovers = [(r, c) for r in range(rows) for c in range(cols) if cells[r, c] and (r, c) not in visited]
    for extra in leftovers:
        options = [
            (extra[0] + dr, extra[1] + dc)
            for dr, dc in DIRS
            if (extra[0] + dr, extra[1] + dc) in visited
        ]
        if not options:
            continue
        link = rng.choice(options)
        visited.add(extra)
        passages.add(tuple(sorted((extra, link))))  # type: ignore[arg-type]
    return passages


def _cell_center(row: int, col: int, cell_size: int, margin: int) -> tuple[int, int]:
    return margin + col * cell_size + cell_size // 2, margin + row * cell_size + cell_size // 2


def _draw_maze(
    shape: tuple[int, int],
    cells: np.ndarray,
    passages: set[tuple[tuple[int, int], tuple[int, int]]],
    cell_size: int,
    margin: int,
    wall: int,
    clip: np.ndarray,
) -> tuple[np.ndarray, tuple[int, int], tuple[int, int]]:
    canvas = np.full(shape, 255, dtype=np.uint8)
    rows, cols = cells.shape

    def cell_box(row: int, col: int) -> tuple[int, int, int, int]:
        x0 = margin + col * cell_size
        y0 = margin + row * cell_size
        return x0, y0, x0 + cell_size, y0 + cell_size

    for row in range(rows):
        for col in range(cols):
            if not cells[row, col]:
                continue
            x0, y0, x1, y1 = cell_box(row, col)
            cv2.rectangle(canvas, (x0, y0), (x1, y1), 0, wall)

    for (r1, c1), (r2, c2) in passages:
        ax0, ay0, ax1, ay1 = cell_box(r1, c1)
        bx0, by0, bx1, by1 = cell_box(r2, c2)
        if r1 == r2:
            x = min(ax1, bx1) - wall
            cv2.rectangle(canvas, (x, ay0 + wall), (x + wall * 2, ay1 - wall), 255, -1)
        else:
            y = min(ay1, by1) - wall
            cv2.rectangle(canvas, (ax0 + wall, y), (ax1 - wall, y + wall * 2), 255, -1)

    in_cells = [(r, c) for r in range(rows) for c in range(cols) if cells[r, c]]
    start = min(in_cells, key=lambda rc: (rc[1], rc[0]))
    finish = max(in_cells, key=lambda rc: (rc[1], rc[0]))

    sx0, sy0, sx1, sy1 = cell_box(*start)
    fx0, fy0, fx1, fy1 = cell_box(*finish)
    cv2.rectangle(canvas, (sx0 - wall, sy0 + wall), (sx0 + wall * 2, sy1 - wall), 255, -1)
    cv2.rectangle(canvas, (fx1 - wall * 2, fy0 + wall), (fx1 + wall, fy1 - wall), 255, -1)

    maze_ink = cv2.bitwise_and(cv2.bitwise_not(canvas), clip)
    maze_paper = cv2.bitwise_not(maze_ink)
    start_xy = _cell_center(*start, cell_size, margin)
    finish_xy = _cell_center(*finish, cell_size, margin)
    return maze_paper, start_xy, finish_xy


def _load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in KOREAN_FONT_CANDIDATES:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def _draw_flag(draw: ImageDraw.ImageDraw, origin: tuple[int, int], kind: str) -> None:
    x, y = origin
    if kind == "start":
        draw.rectangle((x, y - 42, x + 6, y + 18), fill=(180, 40, 40))
        draw.polygon([(x + 6, y - 42), (x + 46, y - 26), (x + 6, y - 10)], fill=(220, 50, 50))
    else:
        draw.rectangle((x, y - 36, x + 6, y + 18), fill=(40, 40, 40))
        for row in range(4):
            for col in range(5):
                color = (20, 20, 20) if (row + col) % 2 == 0 else (245, 245, 245)
                draw.rectangle(
                    (x + 6 + col * 8, y - 36 + row * 8, x + 14 + col * 8, y - 28 + row * 8),
                    fill=color,
                )


def annotate_start_finish(gray: np.ndarray, start_xy: tuple[int, int], finish_xy: tuple[int, int]) -> np.ndarray:
    rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    image = Image.fromarray(rgb)
    draw = ImageDraw.Draw(image)
    font = _load_font(28)

    start_pos = (max(8, start_xy[0] - 170), max(36, start_xy[1] - 20))
    finish_pos = (min(gray.shape[1] - 210, finish_xy[0] + 18), min(gray.shape[0] - 20, finish_xy[1] + 8))

    _draw_flag(draw, (start_pos[0] + 118, start_pos[1]), "start")
    _draw_flag(draw, (finish_pos[0] + 132, finish_pos[1]), "finish")
    draw.text(start_pos, "START", font=font, fill=(20, 20, 20))
    draw.text(finish_pos, "FINISH", font=font, fill=(20, 20, 20))

    arrow_s = (start_xy[0] - 12, start_xy[1])
    draw.polygon(
        [(arrow_s[0], arrow_s[1]), (arrow_s[0] - 22, arrow_s[1] - 12), (arrow_s[0] - 22, arrow_s[1] + 12)],
        fill=(30, 30, 30),
    )
    arrow_f = (finish_xy[0] + 12, finish_xy[1])
    draw.polygon(
        [(arrow_f[0], arrow_f[1]), (arrow_f[0] + 22, arrow_f[1] - 12), (arrow_f[0] + 22, arrow_f[1] + 12)],
        fill=(30, 30, 30),
    )
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)


def generate_shape_maze(
    image_path: str | Path,
    output_path: str | Path,
    cell_size: int = 22,
    seed: int = 7,
    protect_face: bool = True,
) -> np.ndarray:
    gray = _read_gray(Path(image_path))
    outline, interior = extract_interior_mask(gray)
    face = protect_face_mask(outline, interior) if protect_face else np.zeros_like(interior)
    maze_mask = maze_area_mask(interior, face) if protect_face else interior

    margin = 8
    cells = _in_shape_cells(maze_mask, cell_size, margin)
    passages = _carve_maze(cells, random.Random(seed))
    maze, start_xy, finish_xy = _draw_maze(
        gray.shape, cells, passages, cell_size, margin, wall=2, clip=maze_mask
    )

    outline_thick = cv2.dilate(outline, np.ones((3, 3), np.uint8), iterations=1)
    result = maze.copy()
    result[interior == 0] = 255
    result[face > 0] = 255
    result[outline_thick > 0] = 0
    labeled = annotate_start_finish(result, start_xy, finish_xy)
    _write_png(Path(output_path), labeled)
    return labeled


def _register_pdf_font() -> str:
    for candidate in KOREAN_FONT_CANDIDATES:
        if candidate.exists():
            pdfmetrics.registerFont(TTFont("DooliaSans", str(candidate)))
            return "DooliaSans"
    return "Helvetica"


def build_maze_pdf(image_path: Path, pdf_path: Path, title: str) -> None:
    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    font_name = _register_pdf_font()
    page_w, page_h = A4
    pdf = canvas.Canvas(str(pdf_path), pagesize=A4)
    pdf.setTitle(title)
    pdf.setAuthor("DOOLIA Printables")

    margin = 14 * mm
    title_h = 16 * mm
    footer_h = 14 * mm
    pdf.setFillColorRGB(0.12, 0.16, 0.18)
    pdf.setFont(font_name, 16)
    pdf.drawCentredString(page_w / 2, page_h - margin - 8 * mm, title)

    img_h = page_h - 2 * margin - title_h - footer_h
    img_w = page_w - 2 * margin
    pdf.drawImage(
        ImageReader(str(image_path)),
        margin,
        margin + footer_h,
        width=img_w,
        height=img_h,
        preserveAspectRatio=True,
        anchor="c",
        mask="auto",
    )
    pdf.setFillColorRGB(0.35, 0.32, 0.28)
    pdf.setFont("Helvetica", 9)
    pdf.drawCentredString(page_w / 2, 8 * mm, "© DOOLIA Printables")
    pdf.save()


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a maze inside a closed character outline")
    parser.add_argument("image_path")
    parser.add_argument("output_path")
    parser.add_argument("--pdf-path")
    parser.add_argument("--title", default="Tiger Maze - 아기 호랑이 미로 찾기")
    parser.add_argument("--cell-size", type=int, default=22)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--no-face-protect", action="store_true")
    args = parser.parse_args()
    try:
        generate_shape_maze(
            args.image_path,
            args.output_path,
            cell_size=args.cell_size,
            seed=args.seed,
            protect_face=not args.no_face_protect,
        )
        if args.pdf_path:
            build_maze_pdf(Path(args.output_path), Path(args.pdf_path), args.title)
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR {exc}", file=sys.stderr)
        return 1
    print(f"Saved {args.output_path}")
    if args.pdf_path:
        print(f"Saved {args.pdf_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
