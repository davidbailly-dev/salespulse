# Jalon 006 — Monorepo 🔄

Branche : `feature/monorepo` (depuis `develop`). Livré dans : —

## Objectif

Le dépôt est un monorepo npm workspaces : l'application Next.js vit dans `apps/web` et les
schémas Zod dans un paquet partagé `packages/contracts`, prêt à être consommé par le futur backend.
Aucun comportement ne change : mêmes pages, mêmes données, mêmes tests, mêmes commandes depuis la
racine.

## Contexte

- Le projet prépare un backend réel (voir « Backend réel » dans `docs/roadmap.md`) : orchestrateur
  et source de vérité des commandes clients, alimenté par les boutiques externes (WooCommerce
  d'abord), stocké dans PostgreSQL (Neon en production, Docker en local), et consommé par le
  front. Il sera intégré à ce dépôt.
- `docs/stack.md` a décidé que les schémas Zod seraient partagés entre le backend et l'interface,
  et laissé ouvert l'emplacement commun (dépôt unique ou paquet partagé). Aujourd'hui les
  schémas sont dans `src/lib/mock-data/schemas.ts`, importés par plus de 80 fichiers.
- Le déplacement est isolé dans son propre jalon : c'est un gros diff mécanique, qui ne doit pas
  se mélanger avec la construction du backend. Les jalons suivants (API, PostgreSQL, contrat
  `Order` réel, connecteur WooCommerce) partent d'une structure déjà en place.
- Le déploiement de la démo Render n'est pas décrit dans le dépôt (aucun `render.yaml`) : ses
  commandes de build et de démarrage devront suivre le déplacement.

## Décisions

- **D1 (2026-11-18) — Monorepo npm workspaces** : `apps/web` (l'application actuelle) et
  `packages/contracts` (schémas Zod et types) ; `apps/api` arrivera au jalon suivant — un seul
  dépôt, pas de publication de paquet, et l'emplacement commun des schémas laissé ouvert dans
  `docs/stack.md` est tranché.
- **D2 (2026-11-18) — Pur déplacement, sans changement de comportement** : aucune fonctionnalité,
  aucun correctif, aucune mise à jour de dépendance dans ce jalon — le filet de sécurité est la
  suite existante, un écart de comportement signale une erreur de déplacement. Hors TDD (voir
  `docs/tdd.md` : configuration et structure, pas de comportement).
- **D3 (2026-11-18) — `contracts` consommé en TypeScript source, sans étape de build** :
  `exports` pointe vers `src/index.ts` et Next transpile le paquet (`transpilePackages`) — pas de
  build intermédiaire à relancer à chaque modification d'un schéma. Le mode de consommation côté
  Node (futur backend) se tranchera au jalon de l'API.
- **D4 (2026-11-18) — Périmètre de `contracts`** : uniquement `schemas.ts` (schémas Zod et types
  déduits). Les générateurs Faker, `store.ts`, les builders de test et les hooks restent dans
  `apps/web` ; les générateurs partiront dans l'API au jalon suivant — on ne déplace que ce qui
  est partagé aujourd'hui.
- **D5 (2026-11-18) — Noms et imports** : paquets `@salespulse/web` et `@salespulse/contracts` ;
  imports relatifs à l'intérieur d'un paquet (la règle « pas d'alias `@/` » est conservée), par
  nom de paquet entre paquets.
- **D6 (2026-11-18) — Racine minimale** : un seul `package-lock.json`, `.node-version` et
  `engines` à la racine ; aucune dépendance de production à la racine ; scripts `dev`, `build`,
  `start`, `lint`, `test*` délégués à `@salespulse/web`. Un script `typecheck` remplace
  `npx tsc --noEmit` : à la racine d'un monorepo, `tsc` ne couvre plus qu'un seul projet.
- **D7 (2026-11-18) — Pas de release** : le jalon n'a aucun effet visible pour l'utilisateur
  (`docs/gitflow.md`) ; il part avec la prochaine release qui en a un.

## Phase A — Workspaces et déplacement de l'application ⬜

Un seul commit : tant que tout n'est pas déplacé, rien ne tourne.

- [ ] Relever la base de comparaison sur `develop` avant de déplacer : nombre de fichiers et de
      tests de `npm test`, empreinte de la réponse de `/api/orders` (`curl … | sha256sum` sur un
      serveur lancé), à noter dans le Journal.
- [ ] `package.json` (racine) : `private: true`, `workspaces: ["apps/*", "packages/*"]`, `engines`,
      scripts délégués (D6). Vérifier si le champ `allowScripts` doit rester à la racine pour être
      lu par npm.
- [ ] `git mv` vers `apps/web/` de `src/`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`,
      `vitest.config.mts` ; `apps/web/package.json` (`@salespulse/web`) reprend les dépendances.
      `package-lock.json` régénéré à la racine, `agentRules: false` conservé dans
      `next.config.ts`.
- [ ] `tsconfig.base.json` (racine, options communes) étendu par `apps/web/tsconfig.json`, qui
      garde le plugin `next`, `jsx` et son `include`.
- [ ] `eslint.config.mjs` reste à la racine et lint tout le dépôt ; `ignores` adaptés
      (`**/.next/**`, `**/coverage/**`) ; régler `settings.next.rootDir` si une règle Next ne
      trouve plus `app/`.
- [ ] `.gitignore` : motifs ancrés (`/node_modules`, `/.next/`, `/coverage`) rendus valables dans
      les sous-dossiers.
- [ ] Mêmes nombres de fichiers et de tests qu'à la base ; `git log --follow` retrouve
      l'historique d'un fichier déplacé.

## Phase B — Paquet `contracts` ⬜

- [ ] `packages/contracts/package.json` (`@salespulse/contracts`, `private`, `exports` vers
      `./src/index.ts`, seule dépendance : `zod`) et `tsconfig.json` étendant la base.
- [ ] `git mv` de `apps/web/src/lib/mock-data/schemas.ts` vers `packages/contracts/src/schemas.ts`,
      réexporté par `packages/contracts/src/index.ts`.
- [ ] Tous les imports des schémas et types (y compris les `./schemas` internes à `mock-data`)
      pointent vers `@salespulse/contracts` ; `git grep "mock-data/schemas"` ne trouve plus rien.
- [ ] `apps/web/package.json` dépend de `@salespulse/contracts` ; `next.config.ts` ajoute
      `transpilePackages: ['@salespulse/contracts']` (D3).
- [ ] Script `typecheck` à la racine : `tsc --noEmit` sur `apps/web` et sur `packages/contracts`.
- [ ] `npm test`, `npm run lint` et `npm run typecheck` sans erreur.

## Phase C — Documentation ⬜

- [ ] `CLAUDE.md` : commandes (scripts racine, `typecheck`, lancer un seul fichier de test depuis
      la racine), phrase « les chemins `src/…` sont relatifs à `apps/web/` », structure du dépôt
      (`apps/web`, `packages/contracts`), règle d'import entre paquets (D5), critères de
      validation des jalons (`npm run typecheck` à la place de `npx tsc --noEmit`).
- [ ] `docs/stack.md` : entrée Zod — l'emplacement commun est le paquet `packages/contracts`.
- [ ] `docs/roadmap.md` : le jalon passe dans « Terminés » à la clôture.
- [ ] `README.md` : vérifier que les commandes d'installation et de démarrage fonctionnent telles
      quelles depuis la racine ; aucune modification attendue (changement invisible pour
      l'utilisateur). La capture d'écran reste valable.

## Phase D — Vérification et déploiement ⬜

- [ ] `npm ci` sur un clone propre, puis `npm run build` et `npm start` : `/dashboard` s'affiche.
- [ ] L'empreinte de `/api/orders` est identique à celle relevée en phase A (aucune donnée mockée
      n'a bougé).
- [ ] Noter dans le Bilan les commandes de build et de démarrage à appliquer au service Render
      avant la prochaine release (réglage hors dépôt).

## Journal

- 2026-11-18 : plan rédigé, en attente de validation.

## Workflow Git

Un `docs:` pour ce plan, un `refactor:` pour la phase A (workspaces et déplacement), un
`refactor:` pour la phase B (paquet `contracts`), un `docs:` pour la phase C, puis un `docs:` pour
clore le jalon. Chaque commit garde `npm test`, `npm run lint` et le typage au vert.

## Critères d'acceptation

- `npm ci` à la racine, puis `npm test`, `npm run lint` et `npm run typecheck` sans erreur, avec
  les mêmes nombres de fichiers et de tests qu'avant le déplacement.
- `npm run build` puis `npm start` : `/dashboard` s'affiche, et la réponse de `/api/orders` a la
  même empreinte qu'avant le déplacement.
- `git grep "mock-data/schemas"` ne trouve rien ; `packages/contracts` ne dépend que de `zod`.
- `git log --follow` retrouve l'historique de `apps/web/src/lib/kpis/revenue.ts` et de
  `packages/contracts/src/schemas.ts`.
- `docs/stack.md` et `CLAUDE.md` décrivent la nouvelle structure ; plus aucune commande
  documentée ne suppose les fichiers à la racine.

## Bilan

Rempli à la clôture.
