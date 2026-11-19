#!/usr/bin/env python3
"""Feeds the header of the Disaster Recovery skin: writes src/status.json.

Usage:
  status.py <report.json> <metrics.json>   report written by an agent (see README, "Header data")
  status.py --demo                         sample data, no report or Home Assistant needed

Home Assistant is optional: copy config.example.json to config.json and map your entities.
Every line whose entity is missing from the config is simply skipped.
"""
import calendar, datetime as dt, json, os, sys, urllib.request

K = os.path.dirname(os.path.abspath(__file__))
CFG = {}
if os.path.exists(os.path.join(K, "config.json")):
    CFG = json.load(open(os.path.join(K, "config.json")))
ENT = CFG.get("entities", {})
p = lambda n, s, pl=None: f"{n} {s if n <= 1 else (pl or s + 's')}"

if "--demo" in sys.argv:
    agent = {"verdict": "ATTENTION", "cve": [{"corrige": False}, {"corrige": False}], "corrections": [1, 2], "a_faire": list(range(8))}
    metrics = {"generated": dt.datetime.now().astimezone().isoformat(), "arr": {"radarr": {"imported": [1, 2]}, "sonarr": {"imported": list(range(14))}},
               "ups": {"runtime_min": 16}}
    CFG = {}
    ENT = {}
else:
    agent, metrics = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))

cves = agent.get("cve") or []
op = [c for c in cves if not c.get("corrige")]
arr = metrics.get("arr") or {}
nm = len((arr.get("radarr") or {}).get("imported") or [])
ne = len((arr.get("sonarr") or {}).get("imported") or [])
nf, nt = len(agent.get("corrections") or []), len(agent.get("a_faire") or [])
gen = dt.datetime.fromisoformat(metrics["generated"])
vd = {"OK": ("ok", "green"), "ATTENTION": ("attention", "amber"), "ALERTE": ("alert", "red"), "ALERT": ("alert", "red")}.get(agent.get("verdict"), ("n/a", "mut"))
lines = [
    {"t": f"{p(nf, 'fix', 'fixes')} · {nt} todo", "c": vd[1]},
    {"t": (f"cve : {len(op)} open [!]" if op else (f"cve : {len(cves)} fixed" if cves else "cve : none")),
     "c": "red" if op else ("green" if cves else "mut")},
    {"t": f"{p(nm, 'movie')} · {p(ne, 'episode')}", "c": "mut"},
]

syslog = []
if "--demo" in sys.argv:
    syslog = [{"tag": "power", "msg": "server : 9.92 · ~30 days : 16.62 · 63kwh"},
              {"tag": "cost", "msg": "today : blue · tomorrow : unknown · 0.1654/kwh"},
              {"tag": "sensors", "msg": "cpu : 59°c · 170w · ups : 16mins · pc gaming : 2.13"}]
elif CFG.get("ha_url"):
    try:
        tf = CFG.get("ha_token_file", "ha.token")
        tok = open(tf if os.path.isabs(tf) else os.path.join(K, tf)).read().strip()
        req = urllib.request.Request(CFG["ha_url"].rstrip("/") + "/api/states", headers={"Authorization": "Bearer " + tok})
        S = {s["entity_id"]: s["state"] for s in json.load(urllib.request.urlopen(req, timeout=20))}
        num = lambda k: float(S[ENT[k]]) if k in ENT and S.get(ENT[k]) not in (None, "unknown", "unavailable", "") else None
        cout, kwh = num("cost_month"), num("energy_month")
        if cout is not None:
            days = calendar.monthrange(gen.year, gen.month)[1]
            elapsed = (gen.day - 1) + (gen.hour * 60 + gen.minute) / 1440
            proj = cout / elapsed * days if elapsed > 0.5 else None
            syslog.append({"tag": "power", "msg": f"server : {cout:.2f}" + (f" · ~30 days : {proj:.2f}" if proj else "")
                           + (f" · {kwh:.0f}kwh" if kwh else "")})
        color = lambda k: {"bleu": "blue", "blanc": "white", "rouge": "red", "blue": "blue", "white": "white", "red": "red"}.get(
            (S.get(ENT.get(k, "")) or "").lower(), "unknown")
        tj, tdm, prix = color("tempo_today"), color("tempo_tomorrow"), num("price")
        if "tempo_today" in ENT and (tj != "unknown" or prix is not None):
            syslog.append({"tag": "cost", "msg": f"today : {tj} · tomorrow : {tdm}" + (f" · {prix:.4f}/kwh" if prix else ""),
                           "warn": "red" in (tj, tdm)})
        bits = []
        cpu, w = num("cpu_temp"), num("power")
        if cpu is not None:
            bits.append(f"cpu : {cpu:.0f}°c")
        if w is not None:
            bits.append(f"{w:.0f}w")
        ups = metrics.get("ups") or {}
        if ups.get("runtime_min") is not None:
            bits.append(f"ups : {ups['runtime_min']:.0f}mins")
        pc = num("extra_cost_month")
        if pc is not None:
            bits.append(f"{CFG.get('extra_label', 'extra')} : {pc:.2f}")
        if bits:
            syslog.append({"tag": "sensors", "msg": " · ".join(bits)})
    except Exception as e:
        syslog.append({"tag": "power", "msg": f"home assistant unreachable ({type(e).__name__})", "warn": True})

out = {"verdict": agent.get("verdict", "?"), "verdict_en": vd[0].upper(), "headline": agent.get("headline", ""), "lines": lines,
       "when": gen.strftime("%d/%m %H:%M"), "stamp": gen.strftime("%b %d %H:%M:%S").lower(), "proc": "elliot",
       "pid": 2000 + gen.timetuple().tm_yday, "syslog": syslog}
json.dump(out, open(os.path.join(K, "src", "status.json"), "w"), ensure_ascii=False)
print("header:", " | ".join(l["t"] for l in lines), "||", " | ".join(s["msg"] for s in syslog))
