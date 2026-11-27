# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

SalesPulse : dashboard Next.js de monitoring des ventes e-commerce multi-boutiques, en lecture seule ; l'UI et les libellés sont en français. Aujourd'hui alimenté par des données mockées côté serveur (trois boutiques fictives heroic fantasy), il est en transition vers un SaaS multi-commerçant qui synchronise de vraies boutiques (section « Backend, dans l'ordre » de `docs/roadmap.md`, décisions du jalon 007).
Vision, utilisateurs, non-objectifs et principes techniques : `docs/vision.md` (à lire avant de proposer une fonctionnalité).

## Commandes

Toutes les commandes se lancent **depuis la racine** du dépôt. `dev`, `build` et `start` sont délégués au paquet `@salespulse/web`, `dev:server` et `start:server` au paquet `@salespulse/api` ; `typecheck`, `test` et `test:coverage` parcourent chaque workspace qui a le script (`--workspaces --if-present`), donc le CI aussi.

```bash
npm install
npm run dev        # http://localhost:3000 (redirige vers /dashboard)
npm run build
npm run dev:server     # serveur unique (Express + Next.js en développement), journaux mis en forme
npm run start:server   # serveur unique à partir du build (npm run build avant), journaux JSON
npm run lint       # eslint . sur tout le dépôt (config next core-web-vitals + typescript, règle d'imports d'apps/api)
npm run typecheck  # tsc --noEmit dans chaque paquet
npm test           # Vitest, exécution unique, dans chaque paquet qui a des tests
npm run test:coverage
npm run test:watch -w @salespulse/web   # watch : un paquet à la fois (@salespulse/web ou @salespulse/api)
npm test -w @salespulse/web -- src/lib/kpis/revenue.test.ts       # un seul fichier (chemin relatif à apps/web)
npm test -w @salespulse/api -- src/shared/domain/money.test.ts    # un seul fichier (chemin relatif à apps/api)
```

- Node est fixé à `24.22.1` (`.node-version`, `engines: >=24.22.1 <25`), à la racine.
- La racine n'a pas de `test:watch` : `npm run test:watch --workspaces` lancerait les paquets l'un après l'autre, et le premier watch ne rendrait jamais la main.
- Les tests s'écrivent **avant** le code : voir « Conventions de développement ».
- TypeScript est en `strict: true` (options communes dans `tsconfig.base.json`).

## Structure du dépôt

Monorepo npm workspaces :

```
apps/web/            application Next.js (@salespulse/web) : interface et routes de démonstration
apps/api/            backend (@salespulse/api) : domaine, use cases et adapters, par bounded context
packages/contracts/  schémas Zod du format échangé entre l'API et l'interface (@salespulse/contracts)
docs/                documentation du projet (vision, stack, modèle du domaine, roadmap, jalons, conventions)
```

- Imports : relatifs à l'intérieur d'un paquet (pas d'alias `@/`), par nom de paquet entre paquets (`import { OrderSchema } from '@salespulse/contracts'`). Une app n'importe jamais depuis une autre : ce qu'elles partagent passe par un paquet.
- Un seul `package-lock.json`, à la racine.

## Workflow Git

Le projet suit GitFlow et des conventions de commit, décrits dans des fichiers génériques partagés entre projets :

@docs/gitflow.md

@docs/commits.md

## Documentation utilisateur

Le `README.md` et le `changelog.txt` s'adressent à l'utilisateur. Leurs conventions (`docs/readme.md`, `docs/changelog.md`) et les spécificités du projet se chargent avec ces fichiers (`.claude/rules/`).

## Conventions de développement

### Vocabulaire technique

Dans les échanges avec l'utilisateur et dans la documentation interne (`CLAUDE.md`, `docs/`, jalons), les concepts clés du code se nomment par leur terme anglais, sans traduction : « value object » et non « objet-valeur », de même pour « entity », « aggregate », « bounded context », « repository », « middleware », « hook », « query key », etc. Les phrases restent en français.

- La documentation existante s'aligne au fil de ses modifications, sans réécriture d'ensemble.
- Le README et le `changelog.txt` ne sont pas concernés : ils s'adressent à l'utilisateur du produit, en français et sans jargon interne (voir `docs/readme.md`).

### TDD (Test Driven Development)

Tout changement de comportement suit le TDD, décrit dans un fichier générique partagé entre projets :

@docs/tdd.md

Spécificités du projet :

- Lancer un seul fichier de test : `npm test -w <paquet> -- <chemin relatif au paquet>`.
- Test de caractérisation (sur du code existant, donc vert d'emblée) : son rouge se prouve par une mutation temporaire du code testé, lancée et montrée, puis annulée sans être commitée. Une mutation qui survit révèle un test trop faible : le renforcer.

### Relecture du code

L'utilisateur relit le code selon son risque, comme en équipe professionnelle : le travail avance par lots relisibles, et l'attention se concentre là où une erreur coûte cher.

- Trois niveaux, fixés pour chaque phase dans le fichier du jalon (le plus élevé l'emporte quand une phase en mélange plusieurs) :
  - **critique** : domaine et shared kernel d'`apps/api`, adapters SQL et migrations, authentification et isolation entre commerçants, contrat `@salespulse/contracts`, règle d'imports. Point d'arrêt à chaque commit : test rouge montré, puis diff du code, validation de l'utilisateur avant de proposer le commit ;
  - **standard** : use cases, routes API, hooks, composants, générateurs. Point d'arrêt en fin de phase : l'utilisateur relit les tests (la spécification) et survole le code. Le découpage et les messages des commits de la phase sont proposés ensemble, et créés sur une seule confirmation ;
  - **léger** : styles, libellés, configuration, outillage, documentation interne. Relu à la pull request.
- Chaque compte rendu de relecture signale les choix non évidents et les points d'hésitation, pour orienter la lecture.
- Seuils indicatifs : moins de **300 lignes de code de production par commit** et moins de **800 lignes par pull request, tests compris**. La documentation, `package-lock.json` et les fichiers générés ne comptent pas.
- Un lot qui menace de dépasser se découpe (commit, phase ou jalon) : le signaler avant de continuer, plutôt qu'après.
- Avant de passer une pull request en « prête », lancer `/code-review` sur la branche et corriger ce qui en ressort, ou expliquer pourquoi un point est écarté.
- Une pull request qui touche une zone de relecture critique passe aussi par `/security-audit` (skill générique du projet, lecture seule, rapport dans le terminal) : les correctifs sont choisis avec l'utilisateur d'après le rapport. `/security-audit full` audite tout le dépôt, à la clôture d'un jalon de relecture critique. Le skill rattache ses constats aux principes de sécurité de `docs/vision.md` (P11, P12, P15 à P18, P20, et P21 pour les erreurs remontées).
- La pull request est la relecture d'ensemble, faite par l'utilisateur avant le merge. Sa description dit ce qui change, pourquoi, comment le vérifier, et où porter l'attention.

### Roadmap

Les développements sont planifiés en jalons : un fichier par jalon dans `docs/milestones/`, indexés par `docs/roadmap.md`. Leur convention (`docs/roadmap-conventions.md`) et les spécificités du projet se chargent avec ces fichiers (`.claude/rules/`).

### Vision et stack

Le rôle et la tenue de `docs/vision.md` et de `docs/stack.md` (`docs/project-docs-conventions.md`) se chargent avec ces deux fichiers et avec tout `package.json` : lire `docs/stack.md` avant d'ajouter, de remplacer ou de retirer une dépendance structurante.

## Architecture

Décrite par paquet dans des règles chargées avec les fichiers du paquet : `.claude/rules/api.md`
(`apps/api/`), `.claude/rules/web.md` (`apps/web/`) et `.claude/rules/contracts.md`
(`packages/contracts/`).
