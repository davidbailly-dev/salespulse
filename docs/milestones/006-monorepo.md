# Jalon 006 — Monorepo ✅

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
- **D8 (2026-11-18) — La version produit reste à la racine** : le `package.json` racine porte la
  version du produit (`0.3.2`), les paquets des workspaces sont à `0.0.0` — un seul numéro à
  faire évoluer à la release, au lieu de plusieurs qui divergeraient.
- **D9 (2026-11-18) — Render reste en configuration manuelle** : pas de `render.yaml` dans le
  dépôt, les réglages du service se font dans le back office Render — décision de l'utilisateur.
  Les scripts `build` et `start` de la racine délèguent à `@salespulse/web`, pour que des
  commandes Render standard continuent de fonctionner sans changement.

## Phase A — Workspaces et déplacement de l'application ✅

Un seul commit : tant que tout n'est pas déplacé, rien ne tourne.

- [x] Relever la base de comparaison sur `develop` avant de déplacer : nombre de fichiers et de
      tests de `npm test`, empreinte de la réponse de `/api/orders` (`curl … | sha256sum` sur un
      serveur lancé), à noter dans le Journal.
- [x] `package.json` (racine) : `private: true`, `workspaces: ["apps/*", "packages/*"]`, `engines`,
      scripts délégués (D6). Vérifier si le champ `allowScripts` doit rester à la racine pour être
      lu par npm.
- [x] `git mv` vers `apps/web/` de `src/`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`,
      `vitest.config.mts` ; `apps/web/package.json` (`@salespulse/web`) reprend les dépendances.
      `package-lock.json` régénéré à la racine, `agentRules: false` conservé dans
      `next.config.ts`.
- [x] `tsconfig.base.json` (racine, options communes) étendu par `apps/web/tsconfig.json`, qui
      garde le plugin `next`, `jsx` et son `include`.
- [x] `eslint.config.mjs` reste à la racine et lint tout le dépôt ; `ignores` adaptés
      (`**/.next/**`, `**/coverage/**`) ; régler `settings.next.rootDir` si une règle Next ne
      trouve plus `app/`.
- [x] `.gitignore` : motifs ancrés (`/node_modules`, `/.next/`, `/coverage`) rendus valables dans
      les sous-dossiers.
- [x] Mêmes nombres de fichiers et de tests qu'à la base (l'historique d'un fichier déplacé
      se vérifie après le commit : critères d'acceptation).

## Phase B — Paquet `contracts` ✅

- [x] `packages/contracts/package.json` (`@salespulse/contracts`, `private`, `exports` vers
      `./src/index.ts`, seule dépendance : `zod`) et `tsconfig.json` étendant la base.
- [x] `git mv` de `apps/web/src/lib/mock-data/schemas.ts` vers `packages/contracts/src/schemas.ts`,
      réexporté par `packages/contracts/src/index.ts`.
- [x] Tous les imports des schémas et types (y compris les `./schemas` internes à `mock-data`)
      pointent vers `@salespulse/contracts` ; `git grep "mock-data/schemas"` ne trouve plus rien.
- [x] `apps/web/package.json` dépend de `@salespulse/contracts` ; `next.config.ts` ajoute
      `transpilePackages: ['@salespulse/contracts']` (D3).
- [x] Script `typecheck` à la racine : `tsc --noEmit` sur `apps/web` et sur `packages/contracts`.
- [x] `npm test`, `npm run lint` et `npm run typecheck` sans erreur.

## Phase C — Documentation ✅

- [x] `CLAUDE.md` : commandes (scripts racine, `typecheck`, lancer un seul fichier de test :
      `npm test -w @salespulse/web -- <chemin relatif à apps/web>`, vérifié en phase A), phrase
      « les chemins `src/…` sont relatifs à `apps/web/` », structure du dépôt (`apps/web`,
      `packages/contracts`), règle d'import entre paquets (D5), version portée par le
      `package.json` racine (D8) à la place de « `package.json` / `package-lock.json` », critères
      de validation des jalons (`npm run typecheck` à la place de `npx tsc --noEmit`).
- [x] `docs/stack.md` : entrée Zod — l'emplacement commun est le paquet `packages/contracts`.
- [x] `docs/roadmap.md` : les chemins `src/…` des jalons futurs deviennent `apps/web/src/…`
      (le passage du jalon dans « Terminés » se fait à la clôture, dernier commit).
- [x] `README.md` : vérifier que les commandes d'installation et de démarrage fonctionnent telles
      quelles depuis la racine ; aucune modification attendue (changement invisible pour
      l'utilisateur). La capture d'écran reste valable.

## Phase D — Vérification et déploiement ✅

- [x] `npm ci` sur un clone propre, puis `npm run build` et `npm start` : `/dashboard` s'affiche.
- [x] Les empreintes des routes API (`orders`, `products`, `customers`, `shops`,
      `analytics/traffic`, `analytics/ad-spend`), champs `date` et `registeredAt` retirés, sont
      identiques à celles d'un build de `develop` lancé **au même moment** (clone jetable) :
      aucune donnée mockée n'a bougé. Une base relevée plus tôt ne convient pas, le trafic et
      les dépenses pub dérivent avec l'heure (voir le Journal du 2026-11-18).
- [x] Vérifier les commandes de build et de démarrage du service Render (réglage hors dépôt, D9)
      et les reporter dans le Bilan à la clôture.

## Journal

- 2026-11-18 : plan rédigé, en attente de validation.
- 2026-11-18 : plan validé. Base relevée sur `develop` avant déplacement : 58 fichiers de test,
  620 tests, `npm run lint` et `npx tsc --noEmit` sans erreur.
- 2026-11-18 : découverte : la réponse de `/api/orders` (et de `/api/customers`) **change à chaque
  redémarrage du serveur**. `generateDataset(now = new Date())` date les commandes et les clients
  par rapport à l'heure de démarrage, alors que les `id` viennent d'un Faker à graine fixe et sont
  stables. Une empreinte brute ne prouve donc rien : les empreintes sont calculées sans les champs
  `date` et `registeredAt` (script de relevé hors dépôt) et vérifiées identiques sur deux
  démarrages avant déplacement. Les critères d'acceptation et la phase D sont ajustés en
  conséquence. Le comportement lui-même est voulu (fenêtre glissante) et n'est pas modifié.
- 2026-11-18 : phase A faite. Après déplacement : mêmes 58 fichiers et 620 tests ; `npm run lint`
  (236 fichiers lus, dont 73 `.tsx`) et `npm run typecheck` sans erreur ; `npm run build` sans
  avertissement sur la racine du workspace, `.next` créé dans `apps/web`. Les six empreintes API
  et le code 200 de `/dashboard` sont identiques à ceux d'avant. `npm test -w @salespulse/web --
  src/lib/kpis/revenue.test.ts` lance bien un seul fichier ; `test:coverage` passe aussi.
- 2026-11-18 : lockfile comparé avant et après : aucune version, aucune URL, aucune empreinte
  d'intégrité de dépendance n'a changé, seul le lien de workspace `@salespulse/web` s'ajoute (D2
  respecté). `allowScripts` est resté dans le `package.json` racine, sans avertissement à
  l'installation ; non vérifié que npm l'exploite à cet endroit (le champ n'est pas documenté
  dans npm que je connais). `settings.next.rootDir` ajouté à la config ESLint par précaution.
- 2026-11-18 : phase B faite. 91 fichiers (92 imports) réécrits vers `@salespulse/contracts` ;
  `packages/contracts` ne dépend que de `zod` (plus `typescript` en dev, pour son `typecheck`).
  Mêmes 58 fichiers et 620 tests, `npm run lint` et `npm run typecheck` sans erreur (le
  typage couvre bien `@salespulse/web` et `@salespulse/contracts`), `npm run build` réussi,
  lockfile sans aucune version externe modifiée.
- 2026-11-18 : **correction de la découverte précédente** : les empreintes de `analytics/traffic`
  et `analytics/ad-spend` ne sont pas stables à l'échelle de l'heure. `buildDayShares` pondère le
  premier et le dernier jour de la fenêtre au prorata de l'heure de démarrage, à la milliseconde :
  deux relevés espacés de plusieurs dizaines de minutes diffèrent (les valeurs arrondies ne
  bougent pas sur quelques minutes, d'où l'apparente stabilité observée avant). Preuve que ce n'est
  pas le déplacement : le commit de la phase A (worktree jetable) et la phase B, relevés à
  quelques secondes d'écart dans l'ordre A, B, A, donnent des empreintes identiques. Conséquence :
  la comparaison finale se fait contre un build de `develop` lancé au même moment, pas contre
  une base ancienne (phase D et critères ajustés).
- 2026-11-18 : phase C faite. `CLAUDE.md` : commandes, section « Structure du dépôt », chemins,
  imports entre paquets, version portée par la racine, critères de validation. `docs/stack.md` :
  l'emplacement des schémas partagés est tranché (entrée Zod). `docs/roadmap.md` : quatre chemins
  `src/…` des jalons futurs préfixés par `apps/web/` (écart avec le plan, qui ne le prévoyait pas).
  Aucune référence périmée (`npx tsc`, `npx vitest`, `mock-data/schemas`) ne reste dans
  `CLAUDE.md`, le README, les fichiers génériques de `docs/` ni la skill `/next-task`.
- 2026-11-18 : README vérifié sans modification : `npm run dev` lancé depuis la racine sert
  `/` (307 vers `/dashboard`), `/dashboard` (200) et `/api/shops`, et `next dev` ne modifie ni
  `AGENTS.md` ni `CLAUDE.md` (`agentRules: false` toujours effectif). `npm version X.Y.Z
  --no-git-tag-version` testé sur une copie hors dépôt : il ne change que le `package.json` racine
  et le lockfile, les workspaces restent à `0.0.0` (D8 confirmée).
- 2026-11-18 : décision D9 : Render reste en configuration manuelle (pas de `render.yaml`).
- 2026-11-18 : phase D faite, sur deux clones propres de `feature/monorepo` (`492619e`) et de
  `develop` (`f2cc295`). `npm ci` (435 paquets) puis `npm run build` réussissent dans les deux.
  Démarrage comme le ferait Render, depuis la racine du clone : `PORT=3100 npm start` sert `/`
  (307 vers `/dashboard`), `/dashboard` et ses quatre sous-pages (200), et `/api/orders` (200).
- 2026-11-18 : empreintes des six routes API, relevées en alternance develop, monorepo, develop,
  monorepo à quelques secondes d'écart : identiques entre `develop` et le monorepo, et d'un
  relevé à l'autre. Celles de `orders`, `products`, `customers` et `shops` sont aussi identiques
  à la toute première base relevée en phase A ; seules celles de `analytics/traffic` et
  `analytics/ad-spend` diffèrent de cette base ancienne, à cause de la dérive horaire expliquée
  plus haut.
- 2026-11-18 : pour Render, aucune commande n'a besoin de changer si le service est configuré
  avec le dépôt entier comme racine et les commandes `npm run build` (précédé de `npm install` ou
  `npm ci`) et `npm start` : c'est exactement ce qui vient d'être testé. À vérifier dans le back
  office avant la prochaine release : champ « Root Directory » vide, et aucune commande de
  build ou de démarrage qui suppose `next` ou `src/` à la racine (par exemple `npx next start`,
  ou `cd src`). Les réglages actuels du service n'ont pas été consultés (hors dépôt).
- 2026-11-18 : l'utilisateur confirme que Render surveille `main`. Le jalon n'étant pas publié
  (D7), `main` ne bouge pas et le service n'est pas touché : la vérification du back office se
  fait au moment de préparer la prochaine release.
- 2026-11-18 : jalon clos, Bilan rédigé, index de la roadmap mis à jour.
- 2026-11-18 : écarts avec le plan : `lint` retiré des scripts de `apps/web` (doublon du script
  racine) et `typecheck` ajouté ; version du paquet `@salespulse/web` à `0.0.0` (D8). `npm install`
  signale 17 vulnérabilités « high » : elles viennent de dépendances existantes, dont aucune
  version n'a changé ; hors périmètre, à traiter dans un correctif séparé.

## Workflow Git

Un `docs:` pour ce plan, un `refactor:` pour la phase A (workspaces et déplacement), un
`refactor:` pour la phase B (paquet `contracts`), un `docs:` pour la phase C, puis un `docs:` pour
clore le jalon. Chaque commit garde `npm test`, `npm run lint` et le typage au vert.

## Critères d'acceptation

- `npm ci` à la racine, puis `npm test`, `npm run lint` et `npm run typecheck` sans erreur, avec
  les mêmes nombres de fichiers et de tests qu'avant le déplacement.
- `npm run build` puis `npm start` : `/dashboard` s'affiche, et les réponses des routes API ont
  les mêmes empreintes que celles d'un build de `develop` lancé au même moment (champs `date` et
  `registeredAt` retirés : ils dépendent de l'heure de démarrage du serveur).
- `git grep "mock-data/schemas"` ne trouve rien ; `packages/contracts` ne dépend que de `zod`.
- `git log --follow` retrouve l'historique de `apps/web/src/lib/kpis/revenue.ts` et de
  `packages/contracts/src/schemas.ts`.
- `docs/stack.md` et `CLAUDE.md` décrivent la nouvelle structure ; plus aucune commande
  documentée ne suppose les fichiers à la racine.

## Bilan

Livré : le dépôt est un monorepo npm workspaces. L'application Next.js vit dans `apps/web`
(`@salespulse/web`), les schémas Zod et leurs types dans `packages/contracts`
(`@salespulse/contracts`, TypeScript source, seule dépendance `zod`). Les commandes se lancent
depuis la racine, les scripts d'application sont délégués. `CLAUDE.md`, `docs/stack.md` et les
chemins de `docs/roadmap.md` décrivent la nouvelle structure. Aucun comportement n'a changé.

Chiffres : 237 fichiers déplacés avec `git mv` (historique conservé), 91 fichiers dont les imports
sont réécrits vers `@salespulse/contracts`, un seul `package-lock.json` sans aucune version
externe modifiée. Suite de tests identique avant et après : 58 fichiers, 620 tests, couverture
toujours produite.

Écarts avec le plan :
- **D8 et D9 ajoutées en cours de route** : version produit portée par le `package.json` racine
  (workspaces à `0.0.0`), Render laissé en configuration manuelle.
- Le script `lint` d'`apps/web` est retiré (doublon du script racine) ; `typecheck` est ajouté
  à la racine et dans chaque paquet.
- Quatre chemins `src/…` de `docs/roadmap.md` ont été préfixés par `apps/web/`, ce que le plan ne
  prévoyait pas.
- `CLAUDE.md` gagne une règle que le plan ne nommait pas : `@salespulse/contracts` reste
  indépendant de React, de Next et de Faker (traduction du critère « ne dépend que de `zod` »).
- La méthode de comparaison des données mockées a changé : une empreinte brute de l'API ne tient
  pas d'un démarrage à l'autre (`generateDataset(now)` date commandes et clients à l'heure du
  démarrage ; `buildDayShares` pondère le premier et le dernier jour du trafic à la
  milliseconde). Les empreintes sont donc calculées sans les champs `date` et `registeredAt`, et
  comparées à un build de `develop` lancé au même moment.

Vérifications réellement faites le 2026-11-18 :
- `npm test` (58 fichiers, 620 tests), `npm run lint` (236 fichiers lus en phase A, dont 73
  `.tsx`) et `npm run typecheck` (`@salespulse/web` et `@salespulse/contracts`) sans erreur ;
  `npm run test:coverage` passe ;
- `npm ci` puis `npm run build` sur deux clones propres (`feature/monorepo` et `develop`), puis
  `PORT=… npm start` depuis la racine : `/`, `/dashboard` et ses quatre sous-pages, `/api/orders`
  répondent ;
- empreintes des six routes API (`orders`, `products`, `customers`, `shops`, `analytics/traffic`,
  `analytics/ad-spend`) identiques entre `develop` et le monorepo, relevées en alternance à
  quelques secondes d'écart ;
- `git log --follow` retrouve l'historique de `apps/web/src/lib/kpis/revenue.ts` et de
  `packages/contracts/src/schemas.ts` au-delà des déplacements ;
- `npm run dev` depuis la racine sert l'application sans modifier `AGENTS.md` ni `CLAUDE.md` ;
  `npm version X.Y.Z --no-git-tag-version` ne change que le `package.json` racine et le lockfile
  (testé sur une copie hors dépôt) ;
- `git grep "mock-data/schemas"` ne trouve plus rien.

Non vérifié :
- que npm lit le champ `allowScripts` à la racine (aucun avertissement à l'installation, rien de
  plus) ;
- que `npm run typecheck` échoue sur une erreur de type dans `packages/contracts` : seule la liste
  des fichiers couverts par `tsc` a été contrôlée ;
- les réglages actuels du service Render, hors dépôt.

Avant la prochaine release, dans le back office Render (le service surveille `main`, D9) :
« Root Directory » vide, et aucune commande de build ou de démarrage qui suppose `next` ou `src/`
à la racine (par exemple `npx next start`). Des commandes standard, `npm run build` précédé de
`npm install` ou `npm ci`, puis `npm start`, fonctionnent sans changement.

Points relevés, non traités :
- `npm install` signale 17 vulnérabilités « high », issues de dépendances existantes : correctif
  séparé à planifier.
- Les données mockées dépendent de l'heure de démarrage (voir ci-dessus) : c'est voulu, mais ça
  interdit toute comparaison d'empreintes entre deux moments distincts.

Décisions reportées dans la documentation durable : D1, D3, D5 et D8 sont dans `CLAUDE.md`
(structure du dépôt, imports, version) et D1 dans `docs/stack.md` (entrée Zod). **D9 n'est
reportée nulle part** : `CLAUDE.md` ne décrit pas le déploiement ; elle se documentera au jalon de
déploiement du backend réel. Aucune règle d'architecture nouvelle au-delà.
