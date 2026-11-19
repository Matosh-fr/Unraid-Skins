#!/usr/bin/env python3
"""Installe le skin Disaster Recovery dans la marque par défaut d'Authentik (champ « CSS personnalisé »).

build.py        : base.css (réglages du portail) + skin.css, écrit via `ak shell` dans le conteneur authentik-server
build.py --off  : remet uniquement base.css (état d'avant le skin)
Aucun identifiant n'est nécessaire (ORM Django dans le conteneur). Police et texture : intégrées en data URI (les fichiers servis par Authentik ont un jeton qui expire).
"""
import base64, os, subprocess, sys, tempfile
K = os.path.dirname(os.path.abspath(__file__))
read = lambda n: open(os.path.join(K, "src", n)).read()
b64 = lambda n, m: f"data:{m};base64," + base64.b64encode(open(os.path.join(K, "src", n), "rb").read()).decode()
fill = lambda t: (t.replace("__FONT400__", b64("jbm-400.woff2", "font/woff2")).replace("__FONT700__", b64("jbm-700.woff2", "font/woff2"))
                  .replace("__TEXTURE__", b64("texture.png", "image/png")))
css = read("base.css") + ("" if "--off" in sys.argv else "\n/* === DISASTER RECOVERY === */\n" + fill(read("skin.css")))
with tempfile.NamedTemporaryFile("w", suffix=".css", delete=False) as f:
    f.write(css)
subprocess.run(["docker", "cp", f.name, "authentik-server:/tmp/dr.css"], check=True)
os.unlink(f.name)
subprocess.run(["docker", "exec", "-u", "root", "authentik-server", "chmod", "644", "/tmp/dr.css"], check=True)
code = ("from authentik.brands.models import Brand\nb=Brand.objects.get(default=True)\n"
        "b.branding_custom_css=open('/tmp/dr.css').read()\nb.save()\nprint('OK', len(b.branding_custom_css))")
r = subprocess.run(["docker", "exec", "authentik-server", "ak", "shell", "-c", code], capture_output=True, text=True)
print([l for l in r.stdout.splitlines() if l.startswith("OK")] or r.stderr[-300:])
