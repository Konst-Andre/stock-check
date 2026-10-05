#!/usr/bin/env python3
# StockCheck icon generator — рендер локнутого гліфа комети (valuesLOCK §2) у PNG.
# Гліф у білді = SVG viewBox 0 0 48 48. Контур комети складається ВИКЛЮЧНО з L-сегментів
# (прямі) → рендериться як полігон, без потреби в SVG-рушії.

import colorsys, math, os, re
from PIL import Image, ImageDraw

SS = 8  # supersample

COMET_D = ("M43.00 26.00L41.70 30.76L39.24 34.99L35.80 38.42L31.63 40.83L27.02 42.07L22.29 42.09"
           "L17.75 40.90L13.70 38.59L10.42 35.36L8.09 31.42L6.87 27.05L6.82 22.56L7.91 18.24"
           "L10.06 14.39L13.11 11.24L16.82 9.01L20.94 7.82L25.19 7.73L29.29 8.73L32.95 10.74"
           "L32.95 10.74L29.18 9.03L25.15 8.35L21.12 8.74L17.35 10.13L14.11 12.42L11.60 15.44"
           "L9.96 18.97L9.29 22.76L9.62 26.56L10.90 30.11L13.03 33.17L15.85 35.55L19.15 37.12"
           "L22.70 37.77L26.26 37.49L29.59 36.31L32.47 34.34L34.71 31.73L36.20 28.66L36.83 25.35Z")

# градієнт userSpaceOnUse: offset0 @ (39.91,25.67) → offset1 @ (32.95,10.74)
GRAD_P0 = (39.91, 25.67)
GRAD_P1 = (32.95, 10.74)

# чек: M17.5 25 l4.7 4.7 L32 18.5 · stroke-width 4.4 · round cap/join
CHECK = [(17.5, 25.0), (22.2, 29.7), (32.0, 18.5)]
CHECK_W = 4.4

VARIANTS = {
    "dark":  dict(bg="#0d1512", a=(162, .48, .42), b=(162, .40, .68), ink="#e8f0ec"),
    "light": dict(bg="#eef3f1", a=(162, .72, .30), b=(162, .55, .66), ink="#182c28"),
}


def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360.0, l, s)
    return (round(r * 255), round(g * 255), round(b * 255))


def pts(d):
    nums = [float(x) for x in re.findall(r"-?\d+\.?\d*", d)]
    return list(zip(nums[0::2], nums[1::2]))


def gradient(size, c0, c1, p0, p1, k, off):
    """Лінійний градієнт у координатах viewBox, спроєктований на канву."""
    img = Image.new("RGB", (size, size))
    px = img.load()
    x0, y0 = p0[0] * k + off, p0[1] * k + off
    x1, y1 = p1[0] * k + off, p1[1] * k + off
    dx, dy = x1 - x0, y1 - y0
    den = dx * dx + dy * dy
    for y in range(size):
        for x in range(size):
            t = ((x - x0) * dx + (y - y0) * dy) / den
            t = 0.0 if t < 0 else (1.0 if t > 1 else t)
            px[x, y] = (round(c0[0] + (c1[0] - c0[0]) * t),
                        round(c0[1] + (c1[1] - c0[1]) * t),
                        round(c0[2] + (c1[2] - c0[2]) * t))
    return img


def render(size, variant, glyph_frac):
    """glyph_frac — яку частку сторони канви займає габарит гліфа."""
    v = VARIANTS[variant]
    S = size * SS
    poly = pts(COMET_D)

    # габарит гліфа у viewBox-одиницях (беремо разом із чеком)
    allp = poly + CHECK
    xs, ys = [p[0] for p in allp], [p[1] for p in allp]
    gw = max(max(xs) - min(xs), max(ys) - min(ys)) + CHECK_W  # +штрих: він виступає за центр лінії
    cx, cy = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2

    k = (S * glyph_frac) / gw                      # units → px
    off_x = S / 2 - cx * k
    off_y = S / 2 - cy * k
    T = lambda p: (p[0] * k + off_x, p[1] * k + off_y)

    base = Image.new("RGB", (S, S), v["bg"])       # непрозорий: iOS підкладає чорне під альфу

    # 1) комета: маска-полігон, крізь неї — градієнт
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).polygon([T(p) for p in poly], fill=255)
    grad = Image.new("RGB", (S, S))
    gp = grad.load()
    gx0, gy0 = T(GRAD_P0)
    gx1, gy1 = T(GRAD_P1)
    dx, dy = gx1 - gx0, gy1 - gy0
    den = dx * dx + dy * dy
    c0, c1 = hsl(*v["a"]), hsl(*v["b"])
    bx = mask.getbbox()
    for y in range(bx[1], bx[3]):
        for x in range(bx[0], bx[2]):
            t = ((x - gx0) * dx + (y - gy0) * dy) / den
            t = 0.0 if t < 0 else (1.0 if t > 1 else t)
            gp[x, y] = (round(c0[0] + (c1[0] - c0[0]) * t),
                        round(c0[1] + (c1[1] - c0[1]) * t),
                        round(c0[2] + (c1[2] - c0[2]) * t))
    base.paste(grad, (0, 0), mask)

    # 2) чек: round cap/join = товста лінія + круги в вузлах
    d = ImageDraw.Draw(base)
    w = CHECK_W * k
    C = [T(p) for p in CHECK]
    d.line(C, fill=v["ink"], width=round(w), joint="curve")
    for p in C:
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=v["ink"])

    return base.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    out = "/home/claude/icons_preview"
    os.makedirs(out, exist_ok=True)
    for v in VARIANTS:
        render(180, v, 0.66).save(f"{out}/cand-{v}-180.png")
    print("ok", os.listdir(out))
