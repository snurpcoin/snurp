from PIL import Image, ImageDraw, ImageFilter
import math, random

S = 4
W = 1024 * S
random.seed(7)

bg = Image.new("RGBA", (W, W), (14, 16, 22, 255))
# soft radial glow (mint)
glow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([W*0.12, W*0.12, W*0.88, W*0.88], fill=(84, 220, 180, 120))
glow = glow.filter(ImageFilter.GaussianBlur(W*0.07))
bg.alpha_composite(glow)
d = ImageDraw.Draw(bg)

BODY = (120, 232, 196)      # mint
BODY_D = (54, 160, 130)     # outline
BELLY = (215, 255, 240)
SNOUT = (255, 170, 90)
SNOUT_D = (200, 110, 40)

cx, cy = W*0.50, W*0.56
rx, ry = W*0.26, W*0.28
# body (slightly squashed circle)
d.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=BODY, outline=BODY_D, width=int(W*0.012))
# belly
d.ellipse([cx-rx*0.55, cy-ry*0.05, cx+rx*0.55, cy+ry*0.85], fill=BELLY)
# stubby feet
for sx in (-1, 1):
    fx = cx + sx*rx*0.45; fy = cy + ry*0.95
    d.ellipse([fx-rx*0.22, fy-ry*0.13, fx+rx*0.22, fy+ry*0.13], fill=BODY, outline=BODY_D, width=int(W*0.01))
# little arms
for sx in (-1, 1):
    ax = cx + sx*rx*0.95; ay = cy + ry*0.25
    d.ellipse([ax-rx*0.17, ay-ry*0.12, ax+rx*0.17, ay+ry*0.12], fill=BODY, outline=BODY_D, width=int(W*0.01))
# eyes: big, glossy
for sx in (-1, 1):
    ex = cx + sx*rx*0.38; ey = cy - ry*0.30
    er = rx*0.22
    d.ellipse([ex-er, ey-er*1.15, ex+er, ey+er*1.15], fill=(255,255,255), outline=BODY_D, width=int(W*0.008))
    pr = er*0.62
    px = ex + sx*er*0.12; py = ey + er*0.12
    d.ellipse([px-pr, py-pr, px+pr, py+pr], fill=(30, 34, 48))
    hr = pr*0.38
    d.ellipse([px-pr*0.45-hr, py-pr*0.45-hr, px-pr*0.45+hr, py-pr*0.45+hr], fill=(255,255,255))
# blush
for sx in (-1, 1):
    bx = cx + sx*rx*0.62; by = cy + ry*0.08
    d.ellipse([bx-rx*0.13, by-ry*0.08, bx+rx*0.13, by+ry*0.08], fill=(255, 140, 150, 150))
# snout: long curved tube from face going up-right, ending in a round mouth
pts = []
sx0, sy0 = cx + rx*0.30, cy + ry*0.30
ctrl = (cx + rx*1.25, cy + ry*0.35)
end = (cx + rx*1.30, cy - ry*0.55)
for t in [i/40 for i in range(41)]:
    x = (1-t)**2*sx0 + 2*(1-t)*t*ctrl[0] + t**2*end[0]
    y = (1-t)**2*sy0 + 2*(1-t)*t*ctrl[1] + t**2*end[1]
    pts.append((x, y))
d.line(pts, fill=SNOUT_D, width=int(W*0.085), joint="curve")
d.line(pts, fill=SNOUT, width=int(W*0.065), joint="curve")
# snout base blob on face
d.ellipse([sx0-rx*0.16, sy0-ry*0.14, sx0+rx*0.16, sy0+ry*0.14], fill=SNOUT, outline=SNOUT_D, width=int(W*0.008))
# mouth opening at the end
mr = W*0.045
d.ellipse([end[0]-mr, end[1]-mr, end[0]+mr, end[1]+mr], fill=SNOUT_D)
d.ellipse([end[0]-mr*0.6, end[1]-mr*0.6, end[0]+mr*0.6, end[1]+mr*0.6], fill=(60, 30, 30))
# fee sparkles being sucked in (small green coins/sparkles trailing toward the mouth)
COIN = (255, 220, 90); COIN_D = (200, 150, 30)
for i, (dx, dy, r) in enumerate([(0.09, -0.12, 0.032), (0.19, -0.21, 0.026), (0.28, -0.31, 0.020), (0.36, -0.40, 0.014)]):
    x = end[0] + W*dx; y = end[1] + W*dy; rr = W*r
    d.ellipse([x-rr, y-rr, x+rr, y+rr], fill=COIN, outline=COIN_D, width=int(W*0.006))
    d.line([x-rr*0.35, y, x+rr*0.35, y], fill=COIN_D, width=int(rr*0.25))
# motion lines toward mouth
for k in range(3):
    ang = math.radians(-70 + k*20)
    x1 = end[0] + math.cos(ang)*W*0.075; y1 = end[1] + math.sin(ang)*W*0.075
    x2 = end[0] + math.cos(ang)*W*0.115; y2 = end[1] + math.sin(ang)*W*0.115
    d.line([x1, y1, x2, y2], fill=(200, 255, 235), width=int(W*0.008))

out = bg.resize((1024, 1024), Image.LANCZOS).convert("RGB")
out.save("snurp.png", optimize=True)
print("ok")
