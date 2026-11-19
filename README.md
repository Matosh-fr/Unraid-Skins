# unraid-skins

Skins for the [Unraid](https://unraid.net) web interface, built as overlays for the
[Aurora Theme](https://github.com/Tunefish92/Aurora-Theme) plugin (they ship as Aurora's `custom.css` / `custom.js`).

| Skin | Look | Folder |
|------|------|--------|
| **Disaster Recovery** | Terminal black / off-white / red, Mr. Robot mood with Fallout-CRT glitches, live server report in the header | [`disaster-recovery/`](disaster-recovery/) |

Each skin is self-contained: its own `build.py` (stdlib only), sources in `src/`, and its own README.
Install one by running its `build.py` on the Unraid server; remove it with `build.py --off`.

> Skins replace Aurora's `custom.css` / `custom.js`, so only one skin is active at a time.
> Each `build.py` keeps a copy of whatever it overwrote in its own `backup/` folder.

## License

[MIT](LICENSE), copyright (c) 2026 Matosh-fr. Third-party assets (fonts) keep their own licenses, noted in each skin's README.
