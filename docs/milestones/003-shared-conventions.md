# Jalon 003 — Conventions partagées ✅

Branche : `feature/shared-conventions` (depuis `develop`). Livré dans : v0.3.3

## Contexte

`docs/gitflow.md` a fixé un schéma de réutilisation entre projets : un fichier **générique**,
copiable tel quel, importé par `@docs/<fichier>.md` dans le `CLAUDE.md` du projet, avec les
spécificités du projet à côté de l'import. Trois autres blocs de règles sont aujourd'hui
mélangés à du contenu propre à SalesPulse ou ne sont écrits nulle part :

- le TDD, dans la section « Conventions de développement » du `CLAUDE.md` ;
- le format de cette roadmap, implicite ;
- les conventions de commit, dans le `CLAUDE.md` global et dans la pratique de `git log`.

Décisions :

- **Fichiers autonomes** : chaque fichier se suffit à lui-même, on peut n'en copier qu'un.
- **Aucune référence au projet** : ni SalesPulse, ni Next.js, Vitest, npm, Zod ou chemin `src/…`.
- **Règles personnelles hors des fichiers** : « pas de Co-Authored-By » et « pas de commit ni de
  push sans confirmation » restent dans le `CLAUDE.md` global, car elles portent sur le travail
  avec Claude et non sur le projet.

## Phase A — Fichiers génériques ✅

- [x] `docs/tdd.md` : cycle rouge → vert → refactor, règles (bug = test qui le reproduit, test
      et code dans le même commit, exceptions), extraction en fonction pure, pratiques de test
      (colocalisation, builders déterministes, tests d'invariants pour l'aléatoire).
- [x] `docs/roadmap-conventions.md` : structure du fichier roadmap et d'un jalon, cycle de vie
      d'un jalon, modèle de jalon vide.
- [x] `docs/commits.md` : format Conventional Commits en français, types, granularité.

## Phase B — Branchement dans le projet ✅

- [x] `CLAUDE.md` : importer les trois fichiers, ne garder à côté que les spécificités du projet
      (commande Vitest, builders, schémas Zod, exception de l'outillage UI) et retirer les
      doublons de la section « Commandes ».
- [x] `~/.claude/CLAUDE.md` (hors repo) : la règle Conventional Commits renvoie vers
      `docs/commits.md` quand il existe.

## Workflow Git

Un `docs:` pour ce plan, un `docs:` par fichier générique (avec le branchement correspondant
dans `CLAUDE.md`), puis un `docs:` pour clore le jalon.

## Critères de validation

- `grep -niE "salespulse|next|vitest|npm|zod|src/"` ne trouve rien dans les trois fichiers.
- Le `CLAUDE.md` du projet ne répète plus le contenu des fichiers importés.
- Cette roadmap respecte `docs/roadmap-conventions.md`.
- Les imports `@docs/…` sont chargés dans une nouvelle session (`/memory`).

## Bilan

- Trois fichiers génériques créés, en plus de `docs/gitflow.md` : `docs/tdd.md`,
  `docs/roadmap-conventions.md` et `docs/commits.md`. Le grep de validation ne trouve aucune
  référence au projet.
- Le `CLAUDE.md` importe désormais quatre fichiers `@docs/…` et ne garde que les spécificités :
  commande Vitest, builders, schémas Zod, exception de l'outillage UI, commandes de validation,
  fichiers qui portent la version.
- `docs/tdd.md` va plus loin que l'ancienne section du `CLAUDE.md` : pratiques de test
  (déterminisme, cas limites, noms de tests) et règles pour un agent IA, tirées de la pratique
  des jalons précédents.
- `docs/commits.md` documente le style réellement suivi dans `git log` (présent de l'indicatif à
  la 3ᵉ personne, sans portée), qui n'était écrit nulle part. Ses exemples ont été réécrits pour
  ne plus citer de KPIs du projet.
- Ce jalon est le premier écrit selon `docs/roadmap-conventions.md`.
- Reste à vérifier dans une nouvelle session (`/memory`) que les quatre imports sont chargés.
