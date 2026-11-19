# Disaster Recovery : variante Authentik

Même charte que le skin Unraid (noir, blanc cassé, rouge, JetBrains Mono, scanlines, vignette, hexdump), en CSS pur
puisque Authentik n'accepte pas de JS dans le CSS de marque : carte de connexion encadrée de rouge avec scintillement,
`root@vault:~$ connexion ▌`, logo en glitch périodique, boutons `> continue`, portail avec le prompt clignotant `root@vault: ~/apps # ▌` qui est la barre de recherche (comme sur Unraid), tuiles carrées.

- `src/base.css` : réglages d'origine de la marque (ordre du portail, mobile, tailles de logo), repris tels quels.
- `src/skin.css` : la peau, ajoutée après `base.css`.
- `build.py` : écrit `base.css` + `skin.css` dans le CSS personnalisé de la marque par défaut (via `ak shell`, sans identifiant).
  `build.py --off` ne remet que `base.css`. Sauvegarde du CSS d'avant : `/mnt/nvme/appdata/claude-code/backup-authentik-skin-20261119/`.
- La police et la texture sont intégrées en data URI (les fichiers servis par Authentik ont un jeton qui expire).
