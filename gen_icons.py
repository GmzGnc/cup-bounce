"""
Cup Bounce – Android icon generator
Produces ic_launcher.png + ic_launcher_round.png for every mipmap density.
Run:  python gen_icons.py
"""

from PIL import Image, ImageDraw, ImageFont
import os, math

BASE = r"android\app\src\main\res"

SIZES = {
    "mipmap-mdpi":     48,
    "mipmap-hdpi":     72,
    "mipmap-xhdpi":    96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

# ── Palette ────────────────────────────────────────────────────────────────────
BG          = (10,  10,  26,  255)   # #0a0a1a  – deep navy
BG2         = (18,  18,  50,  255)   # slightly lighter for gradient feel
CUP_BODY    = (255, 220,  60,  255)  # golden yellow cup
CUP_RIM     = (255, 245, 140, 255)   # lighter rim highlight
CUP_SHADOW  = (180, 140,  20, 255)   # cup shadow / lower half
BALL        = (255, 110,  20, 255)   # orange ball
BALL_SHINE  = (255, 220, 160, 255)   # ball specular
STAR        = (255, 255, 255,  80)   # subtle star dots
TEXT_COL    = (200, 220, 255, 255)   # "CB" label


def lerp(a, b, t):
    return a + (b - a) * t


def draw_icon(size: int) -> Image.Image:
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s    = size          # shorthand
    cx   = s / 2
    cy   = s / 2

    # ── Background (rounded-square, filled manually via mask) ─────────────────
    bg = Image.new("RGBA", (s, s), BG)
    bg_d = ImageDraw.Draw(bg)

    # Radial-ish gradient: slightly lighter centre
    radius_center = s * 0.55
    for r in range(int(radius_center), 0, -1):
        t     = r / radius_center
        col   = tuple(int(lerp(c2, c1, t)) for c1, c2 in zip(BG[:3], BG2[:3])) + (255,)
        left  = int(cx - r)
        top   = int(cy - r)
        right = int(cx + r)
        bot   = int(cy + r)
        bg_d.ellipse([left, top, right, bot], fill=col)

    # Star dots for texture
    import random
    rng = random.Random(42)
    for _ in range(max(6, s // 8)):
        sx = rng.randint(2, s - 2)
        sy = rng.randint(2, s - 2)
        r2 = max(1, s // 60)
        a2 = rng.randint(30, 90)
        bg_d.ellipse([sx - r2, sy - r2, sx + r2, sy + r2], fill=(255, 255, 255, a2))

    img.paste(bg, (0, 0))
    draw = ImageDraw.Draw(img)

    # ── Cup geometry ───────────────────────────────────────────────────────────
    # Cup occupies roughly the bottom-centre 60% of the icon
    cup_top_w  = s * 0.52   # rim width
    cup_bot_w  = s * 0.36   # base width
    cup_top_y  = cy - s * 0.05   # rim y  (slightly above centre)
    cup_bot_y  = cy + s * 0.32   # base y

    rim_x1  = cx - cup_top_w / 2
    rim_x2  = cx + cup_top_w / 2
    base_x1 = cx - cup_bot_w / 2
    base_x2 = cx + cup_bot_w / 2

    # Main cup body (trapezoid)
    cup_poly = [
        (rim_x1,  cup_top_y),
        (rim_x2,  cup_top_y),
        (base_x2, cup_bot_y),
        (base_x1, cup_bot_y),
    ]
    draw.polygon(cup_poly, fill=CUP_BODY)

    # Lower-half shadow to give depth
    mid_y = (cup_top_y + cup_bot_y) / 2
    mid_x1 = lerp(rim_x1, base_x1, 0.5)
    mid_x2 = lerp(rim_x2, base_x2, 0.5)
    shadow_poly = [
        (mid_x1,  mid_y),
        (mid_x2,  mid_y),
        (base_x2, cup_bot_y),
        (base_x1, cup_bot_y),
    ]
    draw.polygon(shadow_poly, fill=CUP_SHADOW)

    # Rim highlight (ellipse across the top of the cup)
    rim_h = max(2, s * 0.04)
    draw.ellipse([rim_x1, cup_top_y - rim_h / 2,
                  rim_x2, cup_top_y + rim_h / 2], fill=CUP_RIM)

    # Base rounded cap
    base_h = max(2, s * 0.03)
    draw.ellipse([base_x1, cup_bot_y - base_h / 2,
                  base_x2, cup_bot_y + base_h / 2], fill=CUP_SHADOW)

    # ── Ball (orange) sitting inside the cup, upper portion visible ────────────
    ball_r  = s * 0.17
    ball_cx = cx
    ball_cy = cup_top_y - ball_r * 0.55   # mostly above the rim

    draw.ellipse([ball_cx - ball_r, ball_cy - ball_r,
                  ball_cx + ball_r, ball_cy + ball_r], fill=BALL)

    # Ball specular highlight (top-left)
    sh_r  = ball_r * 0.32
    sh_cx = ball_cx - ball_r * 0.28
    sh_cy = ball_cy - ball_r * 0.32
    draw.ellipse([sh_cx - sh_r, sh_cy - sh_r,
                  sh_cx + sh_r, sh_cy + sh_r], fill=BALL_SHINE)

    # ── "CB" text at the bottom ────────────────────────────────────────────────
    font_size = max(6, int(s * 0.14))
    try:
        # Try to load a system font
        font = ImageFont.truetype("arial.ttf", font_size)
    except Exception:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()

    label = "CB"
    bbox  = draw.textbbox((0, 0), label, font=font)
    tw    = bbox[2] - bbox[0]
    th    = bbox[3] - bbox[1]
    tx    = cx - tw / 2
    ty    = cup_bot_y + s * 0.02
    # Subtle shadow
    draw.text((tx + 1, ty + 1), label, fill=(0, 0, 0, 120), font=font)
    draw.text((tx, ty), label, fill=TEXT_COL, font=font)

    return img


def make_round(img: Image.Image) -> Image.Image:
    """Clip to a circle (ic_launcher_round)."""
    s    = img.size[0]
    mask = Image.new("L", (s, s), 0)
    md   = ImageDraw.Draw(mask)
    md.ellipse([0, 0, s, s], fill=255)
    out  = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out.paste(img, mask=mask)
    return out


def main():
    for folder, size in SIZES.items():
        out_dir = os.path.join(BASE, folder)
        os.makedirs(out_dir, exist_ok=True)

        icon       = draw_icon(size)
        icon_round = make_round(icon)

        sq_path  = os.path.join(out_dir, "ic_launcher.png")
        rnd_path = os.path.join(out_dir, "ic_launcher_round.png")

        icon.save(sq_path,       "PNG")
        icon_round.save(rnd_path, "PNG")
        print(f"  {folder}/{size}px  ->  {sq_path}")

    print("\nDone.")


if __name__ == "__main__":
    main()
