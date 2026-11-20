# vault_ (Fallout)

Version « claire » du skin Unraid, alter ego de **eliot_** ([Disaster Recovery](../disaster-recovery/)) :
un terminal RobCo / Pip-Boy, phosphore vert sur verre noir. Le serveur s'appelle Vault ; ce skin en est la
version « lecture seule » d'Eliot.

Il n'est actif **que sur les thèmes clairs d'Unraid** (`Theme--white`, `Theme--azure`). Le thème Black garde
eliot_ (Disaster Recovery), sans changement. Remarque : Aurora ne charge rien sur Azure / Gray (thèmes à barre
latérale), donc en pratique vault_ s'affiche avec le thème **White**.

## Contenu

- **Logo `vault_ >_`** à la place du logo Unraid, avec halo de phosphore et rémanence qui saute de temps en temps.
- **Prompt caché** (même mécanique qu'eliot_) : cliquer derrière `>_` et taper. Le champ est invisible, seuls
  les caractères apparaissent ; les blocs voisins s'estompent (`html.vt-ask-on`). `Entrée` ouvre une popup
  terminal `/webterminal/vault/` (`makeWindow`) et y tape la question environ 3,2 s après le démarrage du terminal.
  `Échap` annule. Le ttyd « vault » n'est pas fourni par ce dépôt.
- **Bloc TERMLINK** dans l'en-tête : verdict et trois lignes clés du dernier rapport d'Eliot
  (`window.__skinStatus`, le même `status.json` que Disaster Recovery), affichés en lecture seule.
- **Ambiance CRT** : JetBrains Mono, lueur verte, lignes de balayage, vignette, bande de tension qui remonte,
  icônes passées en monochrome vert, boutons qui s'inversent au survol, jauges en blocs.
- **Démarrage RobCo** : une fois par session d'onglet, `ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL...` se tape
  par-dessus la page (environ 2 s, ne bloque jamais les clics).
- **Bugs façon Fallout**, un toutes les 2,5 à 6 s : ligne qui saute, caractères qui clignotent (remplacés un
  instant par `#%&@...`, abandon si Unraid met le texte à jour entre-temps), vidéo inverse, surexposition,
  scintillement, barre de balayage, encart `VAULT-TEC LOADING [▮▮▮···]`. Toutes les 20 à 45 s, l'image
  décroche (perte de synchro verticale). Rien ne se déclenche pendant une saisie, un dialogue ouvert ou si le
  système demande moins d'animations.
- Pied de page : `war. war never changes.`

Rien n'est envoyé sur le réseau par le skin.

## Installation

Il n'y a pas de build séparé : `disaster-recovery/build.py` assemble les deux skins dans les mêmes
`custom.css` / `custom.js` d'Aurora, chacun cloisonné par la classe de thème.

```bash
python3 ../disaster-recovery/build.py             # eliot_ (Black) + vault_ (White / Azure)
python3 ../disaster-recovery/build.py --no-vault  # eliot_ seul
python3 ../disaster-recovery/build.py --off       # retire tout
```

Puis passer Unraid en thème **White** (Settings > Display Settings) pour voir vault_. Les fichiers remplacés sont
gardés dans `disaster-recovery/backup/` (`*.orig` au premier passage, `*.prev` à chaque passage).

## Cloisonnement

- CSS : tout est préfixé par `__LIGHT__`, remplacé au build par `html:root:is(.Theme--white, .Theme--azure)`
  (le `:root` donne une spécificité supérieure aux jetons `:root.Theme--white` d'Aurora). Les éléments créés par
  le script sont en `vt-*` / `#vt-*`, sans collision avec les `el-*` d'eliot_.
- JS : le script sort immédiatement si `<html>` n'a ni `Theme--white` ni `Theme--azure`
  (garde `window.__vaultSkinLoaded`, distincte de `__skinLoaded` d'eliot_).
- Tester sans changer le réglage : dans un onglet, remplacer `Theme--black` par `Theme--white` sur `<html>`
  **avant** `DOMContentLoaded` (script d'initialisation du navigateur), puisque le script lit la classe au chargement.
  `window.__vaultBug` expose les effets (`jump`, `chars`, `flash`, `flicker`, `roll`, `loading`, `vhold`).

## Personnaliser

| Quoi | Où |
|------|----|
| Couleurs | variables `--vt-*` et `--tp-*` en tête de `src/skin.css` |
| Rythme et poids des bugs | `src/skin.js`, `fire()` et `loop()` |
| Texte du démarrage RobCo | `src/skin.js`, section 0 |
| URL du terminal | `src/skin.js`, `'/webterminal/vault/'` |

## Licences

Police [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono), SIL OFL 1.1 (`src/OFL.txt`).
Code sous [licence MIT](../LICENSE).
