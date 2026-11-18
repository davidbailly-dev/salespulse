# Jalon 005 — Vision et stack 🔄

Branche : `feature/vision-and-stack` (depuis `develop`). Livré dans : —

## Objectif

Le projet a une vision produit écrite (`docs/vision.md`) et une stack justifiée
(`docs/stack.md`), tenues selon des règles génériques réutilisables dans d'autres projets. Un
agent qui reprend le projet sait ce que le produit fait, ce qu'il ne fait pas, et pourquoi chaque
technologie a été choisie.

## Contexte

- La vision est éparpillée : paragraphe « Projet » de `CLAUDE.md`, présentation du README, jalon
  futur « Backend réel ». Aucun document ne dit ce que le produit **ne fait pas** : rien
  n'empêche un agent de proposer une fonctionnalité hors périmètre.
- Depuis que le README est réservé à l'utilisateur (`docs/readme.md`), la stack n'y figure plus
  que sous forme de badges, sans justification. Le pourquoi des choix n'est écrit nulle part ;
  seul l'historique Git en garde des traces (passage de MSW aux Route Handlers en v0.1.1).
- La skill `/next-task` propose une release dès qu'un jalon est `non publié`, alors que
  `docs/gitflow.md` dit désormais qu'une release n'est pas nécessaire pour des changements sans
  effet pour l'utilisateur. Les jalons 003 et 004, purement internes, déclenchent cette
  proposition à tort.

## Décisions

- **D1 (2026-11-17) — Vision produit uniquement** : `docs/vision.md` décrit le produit, ses
  utilisateurs et son périmètre, rien d'autre — c'est ce qui guide les choix fonctionnels et
  techniques.
- **D2 (2026-11-17) — Vision et stack séparées** : deux fichiers, la vision en amont. La vision
  énonce des contraintes et principes techniques **sans nommer de bibliothèque** ; la stack dit
  quel outil répond à quel principe et y renvoie — les deux n'évoluent pas au même rythme
  (remplacer une bibliothèque ne change pas la vision).
- **D3 (2026-11-17) — Un seul fichier générique de conventions** : `docs/project-docs-conventions.md`
  décrit le rôle, le format et les moments de mise à jour de `vision.md` et de `stack.md` —
  évite de multiplier les petits fichiers génériques.
- **D4 (2026-11-17) — Chargement dans le contexte** : `CLAUDE.md` importe les conventions avec
  `@` ; `docs/vision.md` et `docs/stack.md` sont cités sans `@` et lus à la demande — les
  justifications détaillées n'ont pas à être chargées à chaque session.
- **D5 (2026-11-17) — Paragraphe « Projet » de `CLAUDE.md`** : réduit à un résumé de deux lignes
  avec un lien vers `docs/vision.md` — une seule source pour la vision.
- **D6 (2026-11-17) — Non-objectifs** : gestion opérationnelle (le produit est en lecture seule),
  multi-commerçant (un commerçant, plusieurs boutiques), temps réel, dashboard personnalisable,
  multilingue et multi-devises — ils définissent la nature du produit : observer et analyser,
  pas agir.
- **D7 (2026-11-17) — Pistes futures plutôt que non-objectifs** : authentification et rôles (liée
  au backend réel), alertes et notifications, exports, prévisions, connecteurs aux plateformes
  e-commerce (sous-point du backend réel) — ce sont des évolutions possibles, pas des exclusions.
- **D8 (2026-11-17) — README inchangé** : les badges restent sans texte ni lien vers
  `docs/stack.md` — `docs/readme.md` n'admet que des badges dans la section « Stack technique ».
- **D9 (2026-11-17) — Justifications à confirmer** : dans `docs/stack.md`, toute justification
  déduite du code ou de l'historique est marquée `(à confirmer)` jusqu'à validation par
  l'utilisateur — le pourquoi d'un choix ne se devine pas.
- **D10 (2026-11-18) — Nom du produit dans la vision** : `docs/vision.md` nomme le produit
  (« SalesPulse ») — c'est un document propre au projet, seules les bibliothèques en sont
  exclues ; le grep de `docs/vision.md` ne cherche donc plus « salespulse » (celui du fichier
  générique le garde).

## Phase A — Conventions génériques ✅

- [x] `docs/project-docs-conventions.md` : rôle de `vision.md` (problème, utilisateurs,
      proposition de valeur, non-objectifs, contraintes et principes sans bibliothèque) et de
      `stack.md` (une entrée par technologie : rôle, pourquoi, alternatives écartées, principe
      servi) ; critère « technologie structurante » ; quand les mettre à jour ; règles pour un
      agent IA (lire `stack.md` avant d'ajouter, remplacer ou retirer une dépendance structurante,
      lire `vision.md` avant de proposer une fonctionnalité). Aucune référence au projet.

## Phase B — Vision ✅

- [x] `docs/vision.md` : problème, utilisateurs (gérant, analyste), proposition de valeur,
      non-objectifs (D6), contraintes et principes techniques (fonctionner sans backend réel,
      backend branchable sans réécrire l'interface, état dans l'URL, français et euros, desktop
      et mobile). Aucune bibliothèque nommée.
- [x] `CLAUDE.md` : paragraphe « Projet » réduit à deux lignes avec un lien vers
      `docs/vision.md` (D5) ; import `@docs/project-docs-conventions.md`.

## Phase C — Stack ✅

- [x] `docs/stack.md` : une entrée pour chaque badge du README (Next.js, React, TypeScript,
      TanStack Query, Zod, Tailwind CSS, Recharts, Faker, Vitest), chacune renvoyant à un
      principe de `docs/vision.md` ; justifications déduites marquées `(à confirmer)` (D9) ;
      MSW cité comme alternative écartée pour les données.
- [x] `CLAUDE.md` : `docs/stack.md` cité sans `@` (D4).
- [x] Validation des justifications par l'utilisateur ; plus aucun `(à confirmer)`.

## Phase D — Pistes futures ⬜

- [ ] `docs/roadmap.md` : ajout des pistes de D7 dans « Jalons futurs », les connecteurs en
      sous-point de « Backend réel ».
- [ ] `docs/roadmap.md` : ajout du jalon futur « **TypeScript strict** » (passer `strict` à `true`,
      32 erreurs de type mesurées le 2026-11-18, puis corriger la ligne « TypeScript est en
      `strict: false` » de `CLAUDE.md`).

## Phase E — Skill `/next-task` ⬜

- [ ] `.claude/skills/next-task/SKILL.md` : ne propose une release que si un jalon `non publié`
      apporte un changement visible pour l'utilisateur (règle de `docs/gitflow.md`).
- [ ] `.claude/skills/next-task/SKILL.md` : quand aucun jalon n'est en cours, classe les
      « Jalons futurs » selon `docs/vision.md` (proposition de valeur, utilisateurs servis) et
      signale ceux qui touchent un non-objectif. Ne propose que des pistes présentes dans
      « Jalons futurs » : une idée nouvelle inspirée par la vision est mentionnée en une ligne,
      comme suggestion à ajouter à l'index, jamais comme tâche proposée. La skill reste en
      lecture seule.

## Journal

- 2026-11-17 : plan validé, phase E (skill `/next-task`) incluse dans le jalon.
- 2026-11-18 : phase A faite, `docs/project-docs-conventions.md` écrit ; le grep des critères
  d'acceptation (références au projet) ne trouve rien.
- 2026-11-18 : phase B faite. `docs/vision.md` écrit avec les principes P1 à P10 (identifiants
  repris par `docs/stack.md` en phase C) ; le nom du produit y a été ajouté (D10), le grep de
  la vision ne cherchant plus « salespulse ». `CLAUDE.md` : paragraphe « Projet » réduit, import des
  conventions dans une sous-section « Vision et stack ».
- 2026-11-18 : phase C, `docs/stack.md` écrit (neuf entrées + MSW en technologie retirée) et cité
  dans `CLAUDE.md`. Seul le choix de MSW est documenté par l'historique (commit `6f2ff21`) ; toutes
  les autres justifications sont déduites du code et marquées `(à confirmer)` en attente de
  validation.
- 2026-11-18 : justifications de `docs/stack.md` validées une à une avec l'utilisateur ; plus
  aucun `(à confirmer)`. Décisions prises au passage : le futur backend sera en TypeScript, les
  schémas Zod seront partagés entre le backend et l'interface (emplacement à trancher dans le
  jalon du backend réel), et l'objectif est `strict: true` (32 erreurs de type mesurées). Hors
  périmètre, à traiter ailleurs : `@faker-js/faker` est en `devDependencies` alors que le serveur
  s'en sert à l'exécution.

## Workflow Git

Un `docs:` pour ce plan, un `docs:` par phase A à D, un `chore:` pour la skill (phase E), puis un
`docs:` pour clore le jalon.

## Critères d'acceptation

- `grep -niE "salespulse|next\.js|react|vitest|npm|zod|tanstack|recharts|src/" docs/project-docs-conventions.md`
  ne trouve rien.
- `docs/vision.md` ne nomme aucune bibliothèque (même grep, sans « salespulse » : D10).
- Chaque badge du README a une entrée dans `docs/stack.md`, et chaque entrée renvoie à un
  principe présent dans `docs/vision.md`.
- `grep -n "à confirmer" docs/stack.md` ne trouve rien.
- `CLAUDE.md` : paragraphe « Projet » de deux lignes avec le lien, conventions importées avec
  `@`, `docs/vision.md` et `docs/stack.md` cités sans `@`.
- `npm test`, `npm run lint` et `npx tsc --noEmit` sans erreur.
- Dans une nouvelle session, `/memory` montre l'import de `docs/project-docs-conventions.md`, et
  `/next-task` sur `develop` ne propose pas de release pour les seuls jalons 003 à 005.

## Bilan

<Rempli à la clôture.>
