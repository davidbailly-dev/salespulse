# Jalon 004 — Fichiers de jalons ✅

Branche : `feature/milestone-files` (depuis `develop`). Livré dans : —

## Objectif

`docs/roadmap.md` est un index court qui renvoie vers un fichier par jalon dans `docs/milestones/`,
et `docs/roadmap-conventions.md` décrit un jalon « vivant » : décisions datées, journal tenu en
continu, fichier suffisant pour reprendre le travail après un `/clear`.

## Contexte

L'analyse de `docs/roadmap-conventions.md`, comparée au Spec-Driven Development (GitHub Spec Kit),
aux ExecPlans d'OpenAI (`PLANS.md`), aux ADR (MADR) et à Keep a Changelog, conclut qu'il n'existe
pas de méthode nettement meilleure pour un projet solo piloté avec un agent IA, mais relève des
défauts dans la pratique :

- un seul fichier de 290 lignes pour 3 jalons, qui mélange historique, plan en cours et pistes
  futures, et que deux `feature/*` en parallèle modifient au même endroit ;
- les découvertes ne sont écrites qu'à la clôture, dans le Bilan : après un `/clear`, le jalon ne
  dit ni où on en est ni ce qu'on a appris ;
- les décisions sont réécrites sur place, ce qui perd la trace de l'ancienne décision ;
- « mergée dans `develop` » est écrit avant le merge, et manque sur un jalon ;
- aucun lien entre jalons et versions livrées ;
- aucun seuil qui dit quand un jalon est nécessaire ;
- phases numérotées tantôt 0/1/2, tantôt A/B/C, jalons sans identifiant.

## Décisions

- **D1 (2026-11-17) — Évolution plutôt que remplacement** : on garde la structure actuelle et on
  emprunte aux ExecPlans le journal et la règle de reprise de session — Spec Kit complet (trois
  fichiers par fonctionnalité, constitution) et ExecPlan complet (14 sections) sont trop lourds
  pour un projet solo.
- **D2 (2026-11-17) — Un fichier par jalon** : `docs/milestones/NNN-<nom>.md`, numéroté, nommé
  d'après la branche ; `docs/roadmap.md` devient un index — limite la taille du fichier lu et les
  conflits entre branches.
- **D3 (2026-11-17) — Décisions en journal** : entrées numérotées et datées, jamais réécrites ;
  une décision qui change prend un nouveau numéro et dit laquelle elle remplace — garde la trace
  sans attendre le Bilan.
- **D4 (2026-11-17) — « Livré dans : vX.Y.Z »** remplace « mergée dans `develop` » : le statut ✅
  vaut « mergé », la version est renseignée à la release — n'écrit plus un fait futur.
- **D5 (2026-11-17) — Historique conservé tel quel** : les jalons 001 à 003 sont déplacés sans
  être reformatés au nouveau modèle, seuls leur en-tête et « Livré dans » changent — ce sont des
  traces, pas des documents vivants.
- **D6 (2026-11-17) — Pas d'ADR ni de CHANGELOG dans ce jalon** : les ADR sont surdimensionnés
  pour un projet solo ; le CHANGELOG reste une piste dans les jalons futurs.

## Phase A — Conventions génériques ✅

- [x] `docs/roadmap-conventions.md` : structure de l'index, modèle de jalon (Objectif, Décisions
      datées, Journal, Critères d'acceptation), règles de reprise de session, de livraison et de
      seuil. Aucune référence au projet.

## Phase B — Migration de la roadmap ✅

- [x] `docs/milestones/001-unit-tests.md`, `002-review-fixes.md`, `003-shared-conventions.md` :
      contenu historique déplacé à l'identique, titres de sections remontés d'un niveau, en-tête
      `# Jalon NNN — …` et ligne « Livré dans ».
- [x] `docs/roadmap.md` : index (version, légende, En cours, Terminés, Jalons futurs).
- [x] `CLAUDE.md` : les mentions de `docs/roadmap.md` renvoient vers l'index et les fichiers de
      jalons.

## Journal

- 2026-11-17 : plan validé.
- 2026-11-17 : conventions réécrites ; le grep de références au projet ne trouve rien.
- 2026-11-17 : jalons 001 à 003 déplacés par script (extraction des plages de lignes, titres
  remontés d'un niveau) ; un `diff` avec `develop:docs/roadmap.md` confirme que le texte est
  identique hormis l'en-tête. Versions retrouvées avec `git tag --contains` sur les commits de
  merge : 001 et 002 dans v0.3.2, 003 non publié.
- 2026-11-17 : dans l'index, « phase 3 des tests unitaires » devient « phase 3 du jalon 001 »,
  et la piste CHANGELOG est ajoutée aux jalons futurs (D6).

## Workflow Git

Un `docs:` pour ce plan, un `docs:` pour les conventions (phase A), un `docs:` pour la migration
(phase B), puis un `docs:` pour clore le jalon.

## Critères d'acceptation

- `grep -niE "salespulse|next|vitest|npm|zod|src/" docs/roadmap-conventions.md` ne trouve rien.
- Chaque lien de `docs/roadmap.md` pointe vers un fichier existant.
- Le texte des jalons 001 à 003 est identique à celui de `develop:docs/roadmap.md`, hormis
  l'en-tête, le niveau des titres et la ligne de branche.
- Ce jalon respecte le nouveau modèle de `docs/roadmap-conventions.md`.

## Bilan

- `docs/roadmap-conventions.md` décrit désormais un index et un fichier par jalon, avec un
  Objectif, des Décisions numérotées et datées, un Journal tenu en continu, des Critères
  d'acceptation, une règle de reprise de session, un seuil d'ouverture de jalon et la ligne
  « Livré dans ». Le grep de références au projet ne trouve rien.
- `docs/roadmap.md` passe de 290 à une quarantaine de lignes : il ne garde que l'index et les
  jalons futurs.
- Les jalons 001 à 003 sont dans `docs/milestones/`, au texte identique à celui de `develop`
  hormis l'en-tête (vérifié par `diff`). Ils restent à l'ancien format, comme prévu (D5).
- Écart avec le plan : le premier commit ne met pas le jalon dans « En cours » de l'index,
  puisque l'index n'existait qu'à partir du troisième commit.
- Ajout hors plan : la piste « CHANGELOG » dans les jalons futurs (D6).
- Reste à vérifier dans une nouvelle session (`/memory`) que l'import de
  `docs/roadmap-conventions.md` est chargé, et qu'un agent trouve le jalon en cours depuis
  l'index.
