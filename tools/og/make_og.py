"""OG-картинка 1200x630 в фирменных шрифтах сайта, с эмблемой клуба.

    pip install pillow fonttools brotli
    python tools/og/make_og.py

Берёт портрет из public/assets/img/hero/ (сначала `npm run media`),
белую эмблему tools/og/emblem-white.png (сначала tools/logo/icons.mjs)
и self-hosted Oswald/Manrope из public/fonts/files/.
"""
import os
import tempfile
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

R = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FF = os.path.join(R, "public", "fonts", "files")
os.chdir(tempfile.mkdtemp())  # woff2 → ttf распаковываем во временный каталог
fonts = {
    "osw_cyr": "TK3IWkUHHAIjg75cFRf3bXL8LICs1_Fv40pKlN4NNSeSASz7FmlSHYjedg.woff2",
    "osw_lat": "TK3IWkUHHAIjg75cFRf3bXL8LICs1_Fv40pKlN4NNSeSASz7FmlWHYg.woff2",
}
man = [f for f in os.listdir(FF) if f.startswith("xn7g")]
for k, f in fonts.items():
    t = TTFont(os.path.join(FF, f)); t.flavor = None; t.save(f"{k}.ttf")
for f in man:
    t = TTFont(os.path.join(FF, f)); t.flavor = None; t.save(f"man_{f[:-6]}.ttf")

def font(path, size, wght):
    fo = ImageFont.truetype(path, size)
    try:
        fo.set_variation_by_axes([wght])
    except Exception as e:
        print("var", e)
    return fo

INK = (14, 14, 16); PAPER = (247, 247, 248); RED = (228, 0, 43); MUTED = (170, 170, 176)
W, H = 1200, 630
img = Image.new("RGB", (W, H), INK)
# фото справа
ph = Image.open(os.path.join(R, "public/assets/img/hero/coach-1040.webp")).convert("RGB")
ph = ph.resize((round(ph.width * H / ph.height), H), Image.LANCZOS)
px = W - ph.width
img.paste(ph, (px, 0))
# градиент от фона на левую кромку фото
grad = Image.new("L", (220, H))
gd = ImageDraw.Draw(grad)
for x in range(220):
    gd.line([(x, 0), (x, H)], fill=int(255 * (1 - x / 220) ** 1.6))
img.paste(Image.new("RGB", (220, H), INK), (px, 0), grad)

def skew_text(lines, fnt, colors, x, y, lh):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    k = 0.105  # tan 6°
    for i, (t, c) in enumerate(zip(lines, colors)):
        line = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(line).text((x, y + i * lh), t, font=fnt, fill=c)
        base = y + i * lh + lh * 0.8  # наклон вокруг базовой линии строки
        line = line.transform(line.size, Image.AFFINE, (1, k, -k * base, 0, 1, 0), Image.BICUBIC)
        layer.alpha_composite(line)
    img.paste(layer, (0, 0), layer)

d = ImageDraw.Draw(img)

def mixed(xy, text, cyr, lat, fill):
    """Subset-шрифты: кириллица и латиница/пунктуация в разных файлах."""
    x, y = xy
    cm = TTFont(cyr.path).getBestCmap()
    for ch in text:
        f = cyr if ord(ch) in cm or ch == " " else lat
        d.text((x, y), ch, font=f, fill=fill)
        x += f.getlength(ch)

kick = font("osw_cyr.ttf", 24, 500)
x0 = 72
d.rectangle([x0, 86, x0 + 3, 116], fill=RED)
mixed((x0 + 18, 84), "ТРЕНЕР ПО САМБО  ·  ТУЛА", kick, font("osw_lat.ttf", 24, 500), RED)
name = font("osw_cyr.ttf", 92, 700)
skew_text(["КОПЕЙКИН", "ПАВЕЛ", "СЕРГЕЕВИЧ"], name, [PAPER, PAPER, RED], x0, 138, 98)
manr = [p for p in os.listdir(".") if p.startswith("man_")]
# кириллический subset Manrope — тот, в котором есть «М»
body = None
body_lat = None
for p in manr:
    cm = TTFont(p).getBestCmap()
    if 0x041C in cm and 0x0460 not in cm:
        body = font(p, 24, 500)
    if 0x002C in cm:
        body_lat = font(p, 24, 500)
mixed((x0, 460), "Мастер спорта России по самбо,", body, body_lat, PAPER)
mixed((x0, 492), "рукопашному бою и боевому самбо", body, body_lat, PAPER)
url = font("osw_lat.ttf", 22, 500)
# Эмблема клуба внизу слева, рядом адрес сайта (tools/logo/icons.mjs).
emb = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "emblem-white.png")).convert("RGBA")
emb = emb.resize((92, 92), Image.LANCZOS)
img.paste(emb, (x0 - 6, 522), emb)
d.text((x0 + 104, 553), "KOPEYKIN-SAMBO.RU", font=url, fill=MUTED)
out = os.path.join(R, "public/assets/img/og"); os.makedirs(out, exist_ok=True)
img.save(os.path.join(out, "og-default.jpg"), quality=86, optimize=True, progressive=True)
# Иконки теперь рисует tools/logo/icons.mjs из SVG эмблемы.
print("ok")
