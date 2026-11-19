# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

SalesPulse : dashboard Next.js de monitoring des ventes e-commerce multi-boutiques, en lecture seule ; l'UI et les libellés sont en français. Aujourd'hui alimenté par des données mockées côté serveur (trois boutiques fictives heroic fantasy), il est en transition vers un SaaS multi-commerçant qui synchronise de vraies boutiques (section « Backend, dans l'ordre » de `docs/roadmap.md`, décisions du jalon 007).
Vision, utilisateurs, non-objectifs et principes techniques : `docs/vision.md` (à lire avant de proposer une fonctionnalité).

## Commandes

Toutes les commandes se lancent **depuis la racine** du dépôt ; les scripts d'application sont délégués au paquet `@salespulse/web`.

```bash
npm install
npm run dev        # http://localhost:3000 (redirige vers /dashboard)
npm run build
npm run lint       # eslint . sur tout le dépôt (config next core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit dans chaque paquet
npm test           # Vitest, exécution unique
npm run test:watch
npm run test:coverage
npm test -w @salespulse/web -- src/lib/kpis/revenue.test.ts   # un seul fichier (chemin relatif à apps/web)
```

- Node est fixé à `24.22.1` (`.node-version`, `engines: >=24.22.1 <25`), à la racine.
- **Tests** : Vitest en environnement `node` (`apps/web/vitest.config.mts`), fichiers `*.test.ts`, couverture limitée à `apps/web/src/lib/**` (hors générateurs Faker et hooks). Les tests s'écrivent **avant** le code : voir « Conventions de développement ».
- `apps/web/next.config.ts` contient `agentRules: false` pour empêcher Next de générer/modifier `AGENTS.md` et `CLAUDE.md` : ne pas le retirer. Il déclare aussi `transpilePackages` pour `@salespulse/contracts`.
- TypeScript est en `strict: true` (options communes dans `tsconfig.base.json`).

## Structure du dépôt

Monorepo npm workspaces :

```
apps/web/            application Next.js (@salespulse/web), tout le code décrit plus bas
packages/contracts/  schémas Zod et types partagés (@salespulse/contracts)
docs/                documentation du projet (vision, stack, roadmap, jalons, conventions)
```

- **Sauf mention contraire, les chemins `src/…` de ce fichier sont relatifs à `apps/web/`** (la section « Architecture » les préfixe explicitement).
- Imports : relatifs à l'intérieur d'un paquet (pas d'alias `@/`), par nom de paquet entre paquets (`import { OrderSchema } from '@salespulse/contracts'`).
- `@salespulse/contracts` est publié en TypeScript source, sans étape de build : Next le compile (`transpilePackages`). Il ne dépend que de `zod` ; le garder indépendant de React, de Next et de Faker.
- Un seul `package-lock.json`, à la racine.

## Workflow Git

Le projet suit GitFlow et des conventions de commit, décrits dans des fichiers génériques partagés entre projets :

@docs/gitflow.md

@docs/commits.md

Spécificités du projet :

- La version est portée par le `package.json` **racine** et son `package-lock.json` (`npm version X.Y.Z --no-git-tag-version`, lancé à la racine) et par la ligne « Version actuelle » de `docs/roadmap.md` : les trois changent dans le commit de passage de version, avec l'ajout de l'entrée de la version dans `changelog.txt`. Les paquets des workspaces restent à `0.0.0`.
- Intégration continue : `.github/workflows/ci.yml` (GitHub Actions) lance `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` et `npm run build` sur chaque pull request vers `develop` ou `main` et chaque push sur ces branches. Son job `checks` est la vérification exigée par le ruleset GitHub « develop et main » : ne pas le renommer sans mettre à jour le ruleset.
- Render déploie `main` seulement une fois `checks` passé (*After CI Checks Pass*). Les réglages GitHub (ruleset, méthodes de merge, alertes Dependabot) et Render se font dans leurs interfaces, par l'utilisateur, hors dépôt (jalon 008).
- Pousser une modification de `.github/workflows/` demande le scope `workflow` du jeton de `gh` (remote en HTTPS) : `gh auth refresh -h github.com -s workflow`.

## Documentation utilisateur

Le `README.md` et le `changelog.txt` s'adressent à l'utilisateur et sont tenus selon des fichiers génériques partagés entre projets :

@docs/readme.md

@docs/changelog.md

Spécificités du projet :

- README et changelog en français, comme l'interface.
- Le README affiche une capture du Dashboard (`assets/screenshot-dashboard.png`) et le lien de la démo Render : signaler à l'utilisateur quand la capture ne correspond plus à l'interface.

## Conventions de développement

### Vocabulaire technique

Dans les échanges avec l'utilisateur et dans la documentation interne (`CLAUDE.md`, `docs/`, jalons), les concepts clés du code se nomment par leur terme anglais, sans traduction : « value object » et non « objet-valeur », de même pour « entity », « aggregate », « bounded context », « repository », « middleware », « hook », « query key », etc. Les phrases restent en français.

- La documentation existante s'aligne au fil de ses modifications, sans réécriture d'ensemble.
- Le README et le `changelog.txt` ne sont pas concernés : ils s'adressent à l'utilisateur du produit, en français et sans jargon interne (voir `docs/readme.md`).

### TDD (Test Driven Development)

Tout changement de comportement suit le TDD, décrit dans un fichier générique partagé entre projets :

@docs/tdd.md

Spécificités du projet :

- Lancer un seul fichier de test : `npm test -w @salespulse/web -- <chemin relatif à apps/web>`.
- Fixtures via les builders de `apps/web/src/lib/testing/builders.ts` (`buildOrder`, `buildTrafficRow`, … avec `overrides`), validés contre les schémas Zod par `builders.test.ts`.
- Générateurs Faker : invariants = respect du schéma Zod et déterminisme du seed.
- Hooks et composants se testeront avec Testing Library + jsdom. Tant que cet outillage n'est pas en place (jalon futur « Outillage de tests UI » de `docs/roadmap.md`), le TDD ne s'applique pas directement à eux : extraire leur logique dans une fonction pure, testée d'abord.

### Roadmap

Les développements sont planifiés en jalons : un fichier par jalon dans `docs/milestones/`, indexés par `docs/roadmap.md`, selon un format générique partagé entre projets :

@docs/roadmap-conventions.md

Spécificités du projet : les critères de validation incluent `npm test`, `npm run lint`, `npm run typecheck` et `npm run build` sans erreur, comme l'intégration continue.

### Vision et stack

Le rôle et la tenue de `docs/vision.md` et de `docs/stack.md` sont décrits dans un fichier
générique partagé entre projets :

@docs/project-docs-conventions.md

`docs/vision.md` et `docs/stack.md` ne sont pas importés (lus à la demande) : lire `docs/stack.md`
avant d'ajouter, de remplacer ou de retirer une dépendance structurante.

## Architecture

Flux de données d'un KPI, de bout en bout :

```
mock-data (singleton mémoire) → route API /api/... (filtre + Zod) → hook TanStack Query (lit ?shop=, Zod) → fonction KPI pure (lib/kpis) → composant client (components/dashboard) → Card dans une page (app/dashboard/*)
```

### Données mockées (`apps/web/src/lib/mock-data/`)

- `store.ts` génère le jeu de données **une seule fois par démarrage du serveur** (déclenché par `apps/web/src/instrumentation.ts`) et le garde en mémoire : `getDataset()` (boutiques, produits, clients, commandes) et `getAnalyticsDataset()` (trafic, pages vues, recherches, dépenses pub, Web Vitals, erreurs, e-mails).
- Deux fenêtres de `WINDOW_DAYS` (90) jours sont générées : la fenêtre actuelle (`generator.ts`) et la fenêtre **N-1** un an plus tôt (`historyGenerator.ts` + `HISTORY_ANALYTICS_TUNING` dans `analyticsTuning.ts`), avec des tendances volontairement mixtes (hausses/baisses) pour la comparaison. Les deux fenêtres sont exposées ensemble ; c'est la plage de dates de la requête qui les distingue.
- Génération **déterministe** : chaque générateur a son propre seed (`SEED`, `ATTRIBUTION_SEED`, `HISTORY_SEED`, etc.), souvent via une instance `SimpleFaker` dédiée. Ajouter un tirage aléatoire dans un générateur existant décale toute la séquence et change toutes les données (donc tous les KPIs déjà calibrés) : pour un nouveau champ aléatoire, utiliser une instance Faker séparée avec son propre seed, comme `attributionFaker`.
- Les boutiques et leur poids / tendance N-1 sont dans `SHOP_CONFIGS` (`generator.ts`). Leurs `id` sont des slugs stables car ils apparaissent dans l'URL.
- Les schémas Zod et types (`Order`, `TrafficRow`, …) vivent dans `packages/contracts/src/schemas.ts` (`@salespulse/contracts`) : source de vérité partagée entre serveur et client.
- `analyticsReports.ts` filtre/agrège les données analytics côté serveur. Les lignes analytics sont journalières alors que `from`/`to` sont des instants : les jours partiellement couverts sont **proratisés** (voir le commentaire de tête du fichier). Réutiliser ces fonctions pour toute nouvelle route analytics plutôt que de filtrer à la main.

### Routes API (`apps/web/src/app/api/`)

`orders`, `products`, `customers`, `shops`, et `analytics/<rapport>`. Chaque route lit `from`, `to`, `shop` en query params (sans `shop` = toutes les boutiques ; dates ISO 8601, donc comparaison lexicographique) et valide la réponse avec le schéma Zod de liste correspondant. `products` et `customers` ignorent la plage de dates.

### Hooks de données (`apps/web/src/lib/queries/`)

- Un hook par source (`useOrders`, `useTraffic`, `useAdSpend`, …), signature `(dateRange?, { enabled? })`. **La boutique est lue dans le hook** via `useShopFilter()`, pas passée par les composants. Les URLs analytics passent par `buildAnalyticsUrl()`. La réponse est re-validée avec Zod côté client.
- `useOrders()` sans plage = tout l'historique (utilisé par exemple par le CAC pour déterminer la première commande d'un client) ; passer `enabled: false` pour désactiver une requête, jamais une plage `undefined`.
- `useComparedKpi(useData, calculate)` / `useComparedKpi2(...)` : appliquent la même fonction KPI pure à la période courante et à la période N-1. `previousValue` vaut `undefined` si la comparaison est désactivée, `null` si elle est active mais indisponible.

### Filtres globaux dans l'URL (`apps/web/src/lib/filters/`)

Tout l'état global est en query params, conservé lors de la navigation :
- `?shop=<id>` → `useShopFilter()`
- `?preset=7d|30d|90d|month|lastMonth` ou `?from=&to=` → `useDateRangeFilter()` (défaut `30d`)
- `?compare=yoy` → `useComparisonMode()` / `useComparisonRange()`

`useDateRangeFilter` et `useComparisonRange` sont mémoïsés exprès : les presets dépendent de `new Date()`, et une nouvelle plage à chaque rendu changerait la `queryKey` et relancerait les fetchs en boucle. Conserver cette mémoïsation pour tout nouveau hook dérivé.

Comme ces filtres utilisent `useSearchParams`, `app/dashboard/layout.tsx` appelle `await connection()` pour exclure tout le dashboard du pré-rendu statique (au lieu d'ajouter des `Suspense` partout).

### KPIs et composants

- `apps/web/src/lib/kpis/<kpi>.ts` : fonctions **pures** de calcul, sans React, prenant les données typées par les schémas.
- `apps/web/src/components/dashboard/<Kpi>.tsx` : composant client (`'use client'`) qui combine hook + fonction KPI et gère `Chargement...` / `Erreur de chargement`. Affichage via `KpiValue`, `ScoreGauge`, `CardList` ou Recharts, et `KpiDelta` pour l'évolution N-1.
- `KpiDelta` / `lib/comparison/evolution.ts` : prennent une `polarity` (`higher-is-better`, `lower-is-better`, `neutral`) et un `mode` (`relative` en % pour montants/volumes, `points` pour les KPIs qui sont déjà des taux). Les listes, le CAC et le ratio LTV/CAC n'affichent volontairement pas d'évolution.
- Les pages (`app/dashboard/*/page.tsx`) sont des composants serveur qui assemblent des `CardGroup` > `Card` > `CardTitle` + `CardContent` (`components/ui/Card.tsx`).

Ajouter un KPI = test puis fonction pure dans `lib/kpis/` (TDD), composant dans `components/dashboard/`, puis une `Card` dans la page concernée ; une nouvelle source de données demande en plus un schéma dans `packages/contracts/src/schemas.ts`, un générateur, une route API et un hook.

### Style

Tailwind CSS v4, configuré dans `apps/web/src/app/global.css` via `@theme` (pas de `tailwind.config`). Utiliser les tokens du thème sombre : `bg-surface`, `border-border`, `primary-*`, `secondary-*`, `text-success` / `text-danger` / `text-warning`. Nombres formatés avec `Intl.NumberFormat('fr-FR')`.
