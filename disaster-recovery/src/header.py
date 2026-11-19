# Décor de l'en-tête Unraid façon Elliot : faux journal système en fond (tuile 2400x168, répétée).
# Le fondu au noir est fait en CSS ; la vraie ligne de log (coût électrique…) est du texte posé par custom.js.
import os, random, sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
rnd = random.Random(1986)
W, H = 2400, 168
img = Image.new("RGB", (W, H), (3, 3, 4))
d = ImageDraw.Draw(img)
f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 13)

PROCS = ["kernel", "dockerd", "containerd", "crond", "sshd", "nginx", "emhttpd", "zed", "smartd", "apcupsd",
         "traefik", "crowdsec", "qemu-ga", "avahi-daemon", "rsyslogd", "elliot"]
MSGS = [
    "br-3a83: port {n}(veth{h}) entered forwarding state", "zfs: pool 'storage' scrub in progress, 0 errors",
    "ata{n}.00: configured for UDMA/133", "nvme0: temperature {t}C, ok", "containerd: shim reaped id={h}",
    "connection from 192.168.1.{n} accepted", "GET /api/v1/health 200 {n}ms", "decision ban ip=***.***.{n}.{n} 4h",
    "session opened for user root by (uid=0)", "eth0: link up 10000Mbps full duplex", "rotating /var/log/syslog",
    "check: all pools are healthy", "SMART: sd{c} PASSED", "UPS: on line, battery 100%", "veth{h}: renamed from eth0",
    "cgroup: fork rejected by pids controller", "zed: eid={n} class=config_sync pool='nvme'",
    "watchdog: hello, friend.", "audit: op=login res=success", "mover: nothing to move", "{h}: Up {n} minutes (healthy)",
]


def line():
    m = rnd.choice(MSGS).format(n=rnd.randint(2, 254), h=f"{rnd.getrandbits(28):07x}", t=rnd.randint(34, 58),
                                c="abcdefghijk"[rnd.randint(0, 10)])
    return (f"nov {rnd.randint(1, 30):02d} {rnd.randint(0, 23):02d}:{rnd.randint(0, 59):02d}:{rnd.randint(0, 59):02d} "
            f"vault {rnd.choice(PROCS)}[{rnd.randint(100, 9999)}]: {m}")


y = 3
while y < H - 10:
    x = -rnd.randint(0, 300)
    while x < W:                      # plusieurs entrées par ligne, comme un journal très large
        t = line()
        s = rnd.randint(20, 36)
        hot = rnd.random() < 0.05
        d.text((x, y), t, font=f, fill=(150, 22, 40) if hot else (s, s, s + 5))
        x += int(d.textlength(t, font=f)) + rnd.randint(40, 120)
    y += 17
d = ImageDraw.Draw(img, "RGBA")
for yy in range(0, H, 3):
    d.line([(0, yy), (W, yy)], fill=(0, 0, 0, 70))
d.line([(0, H - 2), (W, H - 2)], fill=(255, 30, 60, 160), width=2)
img.save(os.path.join(OUT, "header.png"), optimize=True)
