#!/usr/bin/env python3
"""Builds the Disaster Recovery skin and installs it into Aurora Theme (custom.css / custom.js).

If the sibling folder ../vault-fallout/ is present, its light-theme skin (vault_) is appended to the
same files. Each skin is scoped to its own Unraid theme class (Theme--black / Theme--white, Theme--azure),
so both can live in Aurora's single custom.css / custom.js.

build.py             : build + install (originals are copied to backup/ on first run,
                       the files being replaced are kept as backup/<name>.prev on every run)
build.py --no-vault  : build the Disaster Recovery skin only
build.py --off       : remove the skin(s)
"""
import base64, os, shutil, sys

K = os.path.dirname(os.path.abspath(__file__))
DST = "/boot/config/plugins/Aurora-Theme"
NAMES = ("custom.css", "custom.js", "custom-login.css")
VAULT = os.path.join(os.path.dirname(K), "vault-fallout", "src")
LIGHT = "html:root:is(.Theme--white, .Theme--azure)"  # :root -> passe devant les jetons :root.Theme--white d'Aurora

if "--off" in sys.argv:
    for n in NAMES:
        if os.path.exists(os.path.join(DST, n)):
            os.remove(os.path.join(DST, n))
    print("skin retiré")
    sys.exit(0)

src = lambda p: os.path.join(K, "src", p)
b64 = lambda p, mime: f"data:{mime};base64," + base64.b64encode(open(p, "rb").read()).decode()
assets = {"__FONT400__": b64(src("jbm-400.woff2"), "font/woff2"), "__FONT700__": b64(src("jbm-700.woff2"), "font/woff2"),
          "__TEXTURE__": b64(src("texture.png"), "image/png"), "__HEADER__": b64(src("header.png"), "image/png")}


def fill(text):
    for k, v in assets.items():
        text = text.replace(k, v)
    return text


status = open(src("status.json")).read() if os.path.exists(src("status.json")) else "null"
out = {"custom.css": fill(open(src("skin.css")).read()),
       "custom.js": "window.__skinStatus = " + status + ";\n" + open(src("skin.js")).read()}
if os.path.exists(src("skin-login.css")):
    out["custom-login.css"] = fill(open(src("skin-login.css")).read())

# vault_ : skin des thèmes clairs, ajouté après le skin sombre (polices reprises de vault-fallout/src)
if "--no-vault" not in sys.argv and os.path.exists(os.path.join(VAULT, "skin.css")):
    vcss = open(os.path.join(VAULT, "skin.css")).read().replace("__LIGHT__", LIGHT)
    for k, f in (("__FONT400__", "jbm-400.woff2"), ("__FONT700__", "jbm-700.woff2")):
        p = os.path.join(VAULT, f) if os.path.exists(os.path.join(VAULT, f)) else src(f)
        vcss = vcss.replace(k, b64(p, "font/woff2"))
    out["custom.css"] += "\n\n/* ======================= vault_ (thèmes clairs) ======================= */\n" + vcss
    out["custom.js"] += "\n;\n" + open(os.path.join(VAULT, "skin.js")).read()
    print("vault_ inclus")

bak = os.path.join(K, "backup")
os.makedirs(bak, exist_ok=True)
for name, content in out.items():
    p = os.path.join(DST, name)
    if os.path.exists(p):
        if not os.path.exists(os.path.join(bak, name + ".orig")):
            shutil.copy2(p, os.path.join(bak, name + ".orig"))
        shutil.copy2(p, os.path.join(bak, name + ".prev"))
    open(p, "w").write(content)
    print(f"{name}: {len(content) // 1024} Ko")
