---
paths:
  - "docs/roadmap.md"
  - "docs/milestones/**"
---

# Conventions de roadmap

Règles de tenue de la roadmap : un plan de travail découpé en **jalons**, écrit avant le code et
tenu à jour pendant le développement. La roadmap se compose d'un **index** (`docs/roadmap.md`) et
d'**un fichier par jalon** (`docs/milestones/`). Ce fichier est **générique** : il peut être copié
tel quel dans n'importe quel projet. Les spécificités d'un projet (commandes de validation, autres
fichiers où vit la version…) se documentent dans ses instructions d'agent (`CLAUDE.md`, règles) ou
son README, pas ici.

---

## Quand ouvrir un jalon

Un jalon pour tout travail qui demande **plusieurs commits de travail** ou **une décision de
conception**. Les petits changements (mise à jour de dépendances, correctif d'une ligne,
retouche de documentation) passent par une simple branche, sans jalon.

## L'index : `docs/roadmap.md`

Court, il ne contient aucun détail de jalon. Dans cet ordre :

1. Titre `# Roadmap <projet>`.
2. Une phrase de présentation et la ligne `Version actuelle : **X.Y.Z**.`, mise à jour à chaque
   passage de version.
3. La légende : `⬜ à faire · 🔄 en cours · ✅ terminé`.
4. `## En cours` : un lien par jalon 🔄 (`🔄 [NNN — Nom](milestones/NNN-nom.md)`), ou
   « Aucun ».
5. `## Terminés` : un lien par jalon ✅, **le plus récent en haut**, suivi de sa version de
   livraison (`✅ [NNN — Nom](milestones/NNN-nom.md) — vX.Y.Z`, ou `— non publié`).
6. `## Jalons futurs` : liste à puces `⬜ **Nom** : description`, pour les pistes à valider et
   prioriser avant d'en faire un jalon.

## Les fichiers de jalon : `docs/milestones/NNN-<nom>.md`

- `NNN` : numéro sur trois chiffres, attribué dans l'ordre de création. Il sert d'identifiant
  (« jalon 007 »).
- `<nom>` : le nom de la branche, sans le préfixe `feature/`.
- Un jalon terminé n'est jamais supprimé : il garde la trace des décisions et du bilan.

### Sections d'un jalon

| Section                      | Contenu                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| Titre                        | `# Jalon NNN — <Nom> <🔄 \| ✅>`                                       |
| En-tête                      | `Branche : \`feature/<nom>\` (depuis \`develop\`). Livré dans : —`, la version étant renseignée à la release. |
| `## Objectif`                | Le résultat observable une fois le jalon terminé, en une ou deux phrases. |
| `## Contexte`                | Le problème, ce qui l'a déclenché.                                    |
| `## Décisions`               | Journal des choix tranchés (voir ci-dessous).                         |
| `## Phase X — <nom>`         | Une phase par lot cohérent, lettrée A, B, C…, avec son état (⬜ 🔄 ✅) et des cases à cocher. Chaque case nomme le fichier concerné et le comportement attendu. |
| `## Journal`                 | Entrées datées, tenues au fil du travail : avancement, découvertes, surprises, points bloquants. |
| `## Workflow Git`            | Le découpage prévu des commits (type et périmètre de chacun).         |
| `## Critères d'acceptation`  | Les vérifications objectives qui disent que le jalon est terminé : commandes à lancer et comportements visibles. |
| `## Bilan`                   | Rempli à la clôture : ce qui a été fait, chiffres (tests, couverture…), écarts avec le plan, vérifications réellement faites. |

Une phase optionnelle ou reportée le dit dans son titre (`⬜ (reprise dans le jalon NNN)`)
plutôt que de disparaître.

### Décisions

- Chaque décision est une entrée numérotée et datée :
  `**D<n> (AAAA-MM-JJ) — <sujet>** : <choix> — <raison>.`
- On **ajoute**, on ne réécrit jamais une entrée. Une décision qui change prend un nouveau numéro
  et dit laquelle elle remplace (`**D4 (…) — remplace D2** : …`).
- Une décision qui dépasse le jalon (nouvelle convention, règle d'architecture) est reportée dans
  la documentation durable du projet ; le Bilan le signale.

### Journal

- Une entrée datée par étape notable : `- AAAA-MM-JJ : <fait>.`
- Une découverte ou une surprise est notée **au moment où elle survient**, pas seulement dans le
  Bilan.

## Cycle de vie d'un jalon

1. **Planifier** : créer le fichier du jalon (état 🔄, phases ⬜) et l'ajouter dans « En cours »
   de l'index, dans un commit `docs:` dédié, en premier commit de la branche.
2. **Développer** : cocher les cases, passer les phases à ✅ et compléter le Journal au fil des
   commits de travail.
3. **Clore** : passer le titre à ✅, remplir le Bilan et déplacer le lien de l'index dans
   « Terminés » (`— non publié`), dans un commit `docs:` dédié, en dernier commit de la branche.
4. **Merger** la branche.
5. **Livrer** : lors du passage de version, renseigner « Livré dans : vX.Y.Z » dans chaque jalon
   livré et remplacer `— non publié` dans l'index.

## Règles pour un agent IA

- Avant de démarrer un jalon, rédiger son fichier et le faire valider.
- **Reprise de session** : avant de reprendre un travail en cours, lire le jalon 🔄 de l'index.
  Le fichier du jalon doit suffire à lui seul pour reprendre le travail : tout ce qui a été
  appris ou décidé y est écrit, pas seulement dans la conversation.
- Tenir les cases à cocher et le Journal à jour dans les commits de travail, pas tout à la fin.
- Dans le Bilan, rapporter fidèlement les écarts et les vérifications réellement faites.

## Modèle de jalon

```markdown
# Jalon NNN — <Nom> 🔄

Branche : `feature/<nom>` (depuis `develop`). Livré dans : —

## Objectif

<Résultat observable une fois le jalon terminé.>

## Contexte

<Problème, déclencheur.>

## Décisions

- **D1 (AAAA-MM-JJ) — <Sujet>** : <choix> — <raison>.

## Phase A — <Nom> ⬜

- [ ] `<fichier>` : <comportement attendu>.

## Journal

- AAAA-MM-JJ : plan validé.

## Workflow Git

Un `docs:` pour ce plan, <commits de travail>, puis un `docs:` pour clore le jalon.

## Critères d'acceptation

- <Vérification objective>.

## Bilan

<Rempli à la clôture.>
```
