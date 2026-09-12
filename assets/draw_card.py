# 1200x630 social card for link previews (X, Telegram, Discord)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1200,630
bg=Image.new("RGB",(W,H),(13,17,23))
glow=Image.new("RGBA",(W,H),(0,0,0,0)); g=ImageDraw.Draw(glow)
g.ellipse([700,40,1180,600],fill=(84,220,180,110)); glow=glow.filter(ImageFilter.GaussianBlur(70))
bg.paste(glow,(0,0),glow)
m=Image.open("snurp.png").convert("RGBA").resize((520,520),Image.LANCZOS)
bg.paste(m,(660,55),m)
d=ImageDraw.Draw(bg)
def font(sz):
    for p in ["/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf","/System/Library/Fonts/Supplemental/Arial Black.ttf","/System/Library/Fonts/Helvetica.ttc"]:
        try: return ImageFont.truetype(p,sz)
        except: pass
    return ImageFont.load_default()
d.text((70,120),"$SNURP",font=font(120),fill=(120,232,196))
d.text((72,265),"Snurp eats fees.",font=font(44),fill=(233,245,240))
d.text((72,320),"Snurp burns supply.",font=font(44),fill=(233,245,240))
d.text((72,375),"Snurp never stops.",font=font(44),fill=(233,245,240))
d.text((72,470),"Robinhood Chain  ·  fair launch on Pons",font=font(26),fill=(143,163,155))
d.text((72,510),"snurpcoin.github.io/snurp",font=font(26),fill=(255,170,90))
bg.save("../docs/card.png",optimize=True); print("card ok")
