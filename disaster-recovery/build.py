#!/usr/bin/env python3
"""Builds the Disaster Recovery skin and installs it into Aurora Theme (custom.css / custom.js).

build.py        : build + install (originals are copied to backup/ on first run)
build.py --off  : remove the skin
"""
import base64, os, shutil, sys

K = os.path.dirname(os.path.abspath(__file__))
DST = "/boot/config/plugins/Aurora-Theme"
NAMES = ("custom.css", "custom.js", "custom-login.css")

if "--off" in sys.argv:
    for n in NAMES:
        if os.path.exists(os.path.join(DST, n)):
            os.remove(os.path.join(DST, n))
    print("skin retiré")
    sys.exit(0)

src = lambda p: os.path.join(K, "src", p)
b64 = lambda p, mime: f"data:{mime};base64," + base64.b64encode(open(src(p), "rb").read()).decode()
assets = {"__FONT400__": b64("jbm-400.woff2", "font/woff2"), "__FONT700__": b64("jbm-700.woff2", "font/woff2"),
          "__TEXTURE__": b64("texture.png", "image/png"), "__HEADER__": b64("header.png", "image/png")}


def fill(text):
    for k, v in assets.items():
        text = text.replace(k, v)
    return text


status = open(src("status.json")).read() if os.path.exists(src("status.json")) else "null"
out = {"custom.css": fill(open(src("skin.css")).read()),
       "custom.js": "window.__skinStatus = " + status + ";\n" + open(src("skin.js")).read()}
if os.path.exists(src("skin-login.css")):
    out["custom-login.css"] = fill(open(src("skin-login.css")).read())

bak = os.path.join(K, "backup")
os.makedirs(bak, exist_ok=True)
for name, content in out.items():
    p = os.path.join(DST, name)
    if os.path.exists(p) and not os.path.exists(os.path.join(bak, name + ".orig")):
        shutil.copy2(p, os.path.join(bak, name + ".orig"))
    open(p, "w").write(content)
    print(f"{name}: {len(content) // 1024} Ko")
