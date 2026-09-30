"""Эмблема Kop.team в SVG — по логотипу клуба (кольцо, «Kop.team»,
подпись «самбо | единоборства»).

    pip install fonttools brotli
    python tools/logo/make_logo.py

Буквы — контуры из self-hosted Manrope (public/fonts/files), поэтому
эмблема не зависит от шрифтов у посетителя и рисуется одним цветом
(currentColor). Результат:
    src/data/logo.json                   — контуры для Logo.astro
    public/assets/brand/kopteam-*.svg    — отдельные файлы (OG, печать)
"""
import json
import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

R = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FF = os.path.join(R, "public", "fonts", "files")
LATIN = os.path.join(FF, "xn7gYHE41ni1AdIRggexSg.woff2")
CYR = os.path.join(FF, "xn7gYHE41ni1AdIRggOxSuXd.woff2")


def instance(path, wght):
    f = TTFont(path)
    return instantiateVariableFont(f, {"wght": wght})


def text_path(font, text, size, x, baseline, tracking=0.0):
    """Контур строки: size — кегль в единицах SVG, tracking — доля кегля."""
    upm = font["head"].unitsPerEm
    s = size / upm
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]
    pen = SVGPathPen(gs)
    cx = x
    for ch in text:
        if ch == " ":
            cx += size * 0.28
            continue
        name = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, cx, baseline))
        gs[name].draw(tp)
        cx += hmtx[name][0] * s + tracking * size
    return compact(pen.getCommands()), cx - tracking * size - x


def compact(d):
    """Координаты до десятых: в 640-px эмблеме разница не видна, а вес в 3 раза меньше."""
    import re
    return re.sub(r"-?\d+\.\d+", lambda m: f"{float(m.group()):.1f}".rstrip("0").rstrip("."), d)


def measure(font, text, size, tracking=0.0):
    _, w = text_path(font, text, size, 0, 0, tracking)
    return w


def bounds(font, text, size, x, baseline, tracking=0.0):
    upm = font["head"].unitsPerEm
    s = size / upm
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]
    bp = BoundsPen(gs)
    cx = x
    for ch in text:
        name = cmap[ord(ch)]
        gs[name].draw(TransformPen(bp, (s, 0, 0, -s, cx, baseline)))
        cx += hmtx[name][0] * s + tracking * size
    return bp.bounds


def main():
    bold = instance(LATIN, 800)
    light_lat = instance(LATIN, 400)
    light_cyr = instance(CYR, 400)

    # ---------- Полная эмблема 640×640 ----------
    W = 640
    ring_r, ring_w = 250, 12
    word = "Kop.team"
    word_size = 90
    word_track = -0.045
    ww = measure(bold, word, word_size, word_track)
    wx = (W - ww) / 2
    word_base = 336
    word_d, _ = text_path(bold, word, word_size, wx, word_base, word_track)

    # Подпись во всю ширину слова: «самбо | единоборства».
    sub_size = 20
    left, right = "самбо", "единоборства"
    gap = 0.9 * sub_size
    lw = measure(light_cyr, left, sub_size)
    rw = measure(light_cyr, right, sub_size)
    free = ww - (lw + rw + 2 * gap)
    letters = len(left) - 1 + len(right) - 1
    track = free / letters / sub_size
    sub_base = word_base + 28
    l_d, lwt = text_path(light_cyr, left, sub_size, wx, sub_base, track)
    bar_x = wx + lwt + gap
    r_d, _ = text_path(light_cyr, right, sub_size, bar_x + gap, sub_base, track)
    bar = {"x": round(bar_x - 1, 2), "y": word_base + 5, "w": 2, "h": sub_base - word_base}

    emblem = {
        "viewBox": f"0 0 {W} {W}",
        "ring": {"cx": W / 2, "cy": W / 2, "r": ring_r, "stroke": ring_w},
        "word": word_d,
        "sub": l_d + r_d,
        "bar": bar,
    }

    # ---------- Строчная версия для навигации ----------
    # Та же пара «Kop.team» + подпись, без кольца: в шапке высотой 64–72 px
    # кольцо съело бы размер букв и подпись стала бы нечитаемой.
    lw_size = 100
    lww = measure(bold, word, lw_size, word_track)
    b = bounds(bold, word, lw_size, 0, 100, word_track)
    lock_word, _ = text_path(bold, word, lw_size, -b[0], 100, word_track)
    ls_size = 21
    llw = measure(light_cyr, left, ls_size)
    lrw = measure(light_cyr, right, ls_size)
    lgap = 0.8 * ls_size
    lfree = lww - (llw + lrw + 2 * lgap)
    ltrack = lfree / letters / ls_size
    lsub_base = 100 + 34
    ll_d, llwt = text_path(light_cyr, left, ls_size, -b[0], lsub_base, ltrack)
    lbar_x = -b[0] + llwt + lgap
    lr_d, _ = text_path(light_cyr, right, ls_size, lbar_x + lgap, lsub_base, ltrack)
    top = b[1]
    height = lsub_base + 6 - top
    lockup = {
        "viewBox": f"0 {round(top - 2, 2)} {round(lww + 2, 2)} {round(height + 4, 2)}",
        "word": lock_word,
        "sub": ll_d + lr_d,
        "bar": {"x": round(lbar_x - 1.2, 2), "y": lsub_base - 21, "w": 2.4, "h": 26},
    }

    # ---------- Только слово — для шапки ----------
    # Подпись «самбо | единоборства» на высоте шапки превращается в точки,
    # поэтому там — одно «Kop.team» той же гарнитуры, с плотной рамкой.
    wb = bounds(bold, word, lw_size, -b[0], 100, word_track)
    wordmark = {
        "viewBox": f"{round(wb[0] - 1, 2)} {round(wb[1] - 1, 2)} {round(wb[2] - wb[0] + 2, 2)} {round(wb[3] - wb[1] + 2, 2)}",
        "word": lock_word,
    }

    os.makedirs(os.path.join(R, "src", "data"), exist_ok=True)
    with open(os.path.join(R, "src", "data", "logo.json"), "w", encoding="utf-8") as f:
        json.dump({"emblem": emblem, "lockup": lockup, "wordmark": wordmark}, f, ensure_ascii=False)

    def svg(color, bg=None):
        e = emblem
        r = e["ring"]
        bar = e["bar"]
        back = f'<circle cx="{r["cx"]}" cy="{r["cy"]}" r="{W / 2}" fill="{bg}"/>' if bg else ""
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{e["viewBox"]}" role="img" '
            f'aria-label="Kop.team — самбо, единоборства">{back}'
            f'<circle cx="{r["cx"]}" cy="{r["cy"]}" r="{r["r"]}" fill="none" stroke="{color}" '
            f'stroke-width="{r["stroke"]}"/>'
            f'<path fill="{color}" d="{e["word"]}"/><path fill="{color}" d="{e["sub"]}"/>'
            f'<rect x="{bar["x"]}" y="{bar["y"]}" width="{bar["w"]}" height="{bar["h"]}" fill="{color}"/></svg>'
        )

    out = os.path.join(R, "public", "assets", "brand")
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "kopteam-emblem.svg"), "w", encoding="utf-8") as f:
        f.write(svg("#0E0E10"))
    with open(os.path.join(out, "kopteam-emblem-white.svg"), "w", encoding="utf-8") as f:
        f.write(svg("#F7F7F8"))
    with open(os.path.join(out, "kopteam-emblem-red.svg"), "w", encoding="utf-8") as f:
        f.write(svg("#FFFFFF", bg="#A30F1A"))
    # ---------- Фавикон: красный круг и «K» из той же гарнитуры ----------
    # На 16 px кольцо с подписью не читаются — остаётся буква-знак клуба.
    fk = 20
    kb = bounds(bold, "K", fk, 0, 0)
    kx = 16 - (kb[0] + kb[2]) / 2
    ky = 16 - (kb[1] + kb[3]) / 2
    k_d, _ = text_path(bold, "K", fk, kx, ky)
    with open(os.path.join(R, "public", "assets", "icons", "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
            '<circle cx="16" cy="16" r="16" fill="#C8102E"/>'
            '<circle cx="16" cy="16" r="13.6" fill="none" stroke="#FFFFFF" stroke-width="1.3"/>'
            f'<path fill="#FFFFFF" d="{k_d}"/></svg>'
        )
    print("ok", round(ww), round(lww))


main()
