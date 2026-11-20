# unraid-skins

Skins for the [Unraid](https://unraid.net) web interface, built as overlays for the
[Aurora Theme](https://github.com/Tunefish92/Aurora-Theme) plugin (they ship as Aurora's `custom.css` / `custom.js`).

| Skin | Look | Folder |
|------|------|--------|
| **Disaster Recovery** | Terminal black / off-white / red, Mr. Robot mood with Fallout-CRT glitches, live server report in the header | [`disaster-recovery/`](disaster-recovery/) |
| **vault_** (Fallout) | Light-theme alter ego: RobCo / Pip-Boy green phosphor terminal, hidden prompt, Fallout glitches (Unraid White theme) | [`vault-fallout/`](vault-fallout/) |

Each skin is self-contained: its own `build.py` (stdlib only), sources in `src/`, and its own README.
Install one by running its `build.py` on the Unraid server; remove it with `build.py --off`.

> Skins replace Aurora's `custom.css` / `custom.js`. `disaster-recovery/build.py` also bundles `vault-fallout/`:
> each skin is scoped to its Unraid theme class (Black -> Disaster Recovery, White -> vault_).
> Each `build.py` keeps a copy of whatever it overwrote in its own `backup/` folder.

## License

[MIT](LICENSE), copyright (c) 2026 Matosh-fr. Third-party assets (fonts) keep their own licenses, noted in each skin's README.
