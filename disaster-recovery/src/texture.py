# Motif de fond : hexdump très sombre, répétable (tuile 720x360)
import os, random, sys
from PIL import Image, ImageDraw, ImageFont
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
rnd = random.Random(1337)
W, H = 720, 360
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 11)
y = 4
while y < H - 12:
    off = rnd.randint(0, 0xFFFFFF)
    line = f"{off:08x}  " + " ".join(f"{rnd.randint(0,255):02x}" for _ in range(16))
    a = rnd.randint(7, 15)
    col = (255, 30, 60, a) if rnd.random() < 0.06 else (200, 200, 210, a)
    d.text((6, y), line, font=f, fill=col)
    y += 15
img.save(os.path.join(OUT, "texture.png"), optimize=True)
