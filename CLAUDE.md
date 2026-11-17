# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

SalesPulse : dashboard Next.js (App Router) de monitoring des ventes e-commerce multi-boutiques. Toutes les données sont **mockées côté serveur** (trois boutiques fictives heroic fantasy) ; il n'y a pas de backend réel, mais l'architecture est pensée pour en brancher un plus tard en ne remplaçant que la couche API. L'UI et les libellés sont en français.

## Commandes

```bash
npm install
npm run dev        # http://localhost:3000 (redirige vers /dashboard)
npm run build
npm run lint       # eslint . (config next core-web-vitals + typescript)
npx tsc --noEmit   # vérification de types (aucun script dédié)
npm test           # Vitest, exécution unique
npm run test:watch
npm run test:coverage
npx vitest run src/lib/kpis/revenue.test.ts   # un seul fichier
```

- Node est fixé à `24.22.1` (`.node-version`, `engines: >=24.22.1 <25`).
- **Tests** : Vitest en environnement `node` (`vitest.config.mts`), fichiers `*.test.ts`, couverture limitée à `src/lib/**` (hors générateurs Faker et hooks). Les tests s'écrivent **avant** le code : voir « Conventions de développement ».
- `next.config.ts` contient `agentRules: false` pour empêcher Next de générer/modifier `AGENTS.md` et `CLAUDE.md` : ne pas le retirer.
- TypeScript est en `strict: false`. Les imports sont relatifs (pas d'alias `@/`).

## Workflow Git

Le projet suit GitFlow, décrit dans un fichier générique partagé entre projets :

@docs/gitflow.md

Spécificités du projet :

- La version est portée par `package.json` / `package-lock.json` (`npm version X.Y.Z --no-git-tag-version`) et par la ligne « Version actuelle » de `docs/roadmap.md` : les trois changent dans le commit de passage de version.

## Conventions de développement

### TDD (Test Driven Development)

Tout changement de comportement suit le TDD, décrit dans un fichier générique partagé entre projets :

@docs/tdd.md

Spécificités du projet :

- Lancer un seul fichier de test : `npx vitest run <fichier>`.
- Fixtures via les builders de `src/lib/testing/builders.ts` (`buildOrder`, `buildTrafficRow`, … avec `overrides`), validés contre les schémas Zod par `builders.test.ts`.
- Générateurs Faker : invariants = respect du schéma Zod et déterminisme du seed.
- Hooks et composants se testeront avec Testing Library + jsdom. Tant que cet outillage n'est pas en place (voir `docs/roadmap.md`), le TDD ne s'applique pas directement à eux : extraire leur logique dans une fonction pure, testée d'abord.

## Architecture

Flux de données d'un KPI, de bout en bout :

```
mock-data (singleton mémoire) → route API /api/... (filtre + Zod) → hook TanStack Query (lit ?shop=, Zod) → fonction KPI pure (lib/kpis) → composant client (components/dashboard) → Card dans une page (app/dashboard/*)
```

### Données mockées (`src/lib/mock-data/`)

- `store.ts` génère le jeu de données **une seule fois par démarrage du serveur** (déclenché par `src/instrumentation.ts`) et le garde en mémoire : `getDataset()` (boutiques, produits, clients, commandes) et `getAnalyticsDataset()` (trafic, pages vues, recherches, dépenses pub, Web Vitals, erreurs, e-mails).
- Deux fenêtres de `WINDOW_DAYS` (90) jours sont générées : la fenêtre actuelle (`generator.ts`) et la fenêtre **N-1** un an plus tôt (`historyGenerator.ts` + `HISTORY_ANALYTICS_TUNING` dans `analyticsTuning.ts`), avec des tendances volontairement mixtes (hausses/baisses) pour la comparaison. Les deux fenêtres sont exposées ensemble ; c'est la plage de dates de la requête qui les distingue.
- Génération **déterministe** : chaque générateur a son propre seed (`SEED`, `ATTRIBUTION_SEED`, `HISTORY_SEED`, etc.), souvent via une instance `SimpleFaker` dédiée. Ajouter un tirage aléatoire dans un générateur existant décale toute la séquence et change toutes les données (donc tous les KPIs déjà calibrés) : pour un nouveau champ aléatoire, utiliser une instance Faker séparée avec son propre seed, comme `attributionFaker`.
- Les boutiques et leur poids / tendance N-1 sont dans `SHOP_CONFIGS` (`generator.ts`). Leurs `id` sont des slugs stables car ils apparaissent dans l'URL.
- `schemas.ts` contient tous les schémas Zod et types (`Order`, `TrafficRow`, …) : source de vérité partagée entre serveur et client.
- `analyticsReports.ts` filtre/agrège les données analytics côté serveur. Les lignes analytics sont journalières alors que `from`/`to` sont des instants : les jours partiellement couverts sont **proratisés** (voir le commentaire de tête du fichier). Réutiliser ces fonctions pour toute nouvelle route analytics plutôt que de filtrer à la main.

### Routes API (`src/app/api/`)

`orders`, `products`, `customers`, `shops`, et `analytics/<rapport>`. Chaque route lit `from`, `to`, `shop` en query params (sans `shop` = toutes les boutiques ; dates ISO 8601, donc comparaison lexicographique) et valide la réponse avec le schéma Zod de liste correspondant. `products` et `customers` ignorent la plage de dates.

### Hooks de données (`src/lib/queries/`)

- Un hook par source (`useOrders`, `useTraffic`, `useAdSpend`, …), signature `(dateRange?, { enabled? })`. **La boutique est lue dans le hook** via `useShopFilter()`, pas passée par les composants. Les URLs analytics passent par `buildAnalyticsUrl()`. La réponse est re-validée avec Zod côté client.
- `useOrders()` sans plage = tout l'historique (utilisé par exemple par le CAC pour déterminer la première commande d'un client) ; passer `enabled: false` pour désactiver une requête, jamais une plage `undefined`.
- `useComparedKpi(useData, calculate)` / `useComparedKpi2(...)` : appliquent la même fonction KPI pure à la période courante et à la période N-1. `previousValue` vaut `undefined` si la comparaison est désactivée, `null` si elle est active mais indisponible.

### Filtres globaux dans l'URL (`src/lib/filters/`)

Tout l'état global est en query params, conservé lors de la navigation :
- `?shop=<id>` → `useShopFilter()`
- `?preset=7d|30d|90d|month|lastMonth` ou `?from=&to=` → `useDateRangeFilter()` (défaut `30d`)
- `?compare=yoy` → `useComparisonMode()` / `useComparisonRange()`

`useDateRangeFilter` et `useComparisonRange` sont mémoïsés exprès : les presets dépendent de `new Date()`, et une nouvelle plage à chaque rendu changerait la `queryKey` et relancerait les fetchs en boucle. Conserver cette mémoïsation pour tout nouveau hook dérivé.

Comme ces filtres utilisent `useSearchParams`, `app/dashboard/layout.tsx` appelle `await connection()` pour exclure tout le dashboard du pré-rendu statique (au lieu d'ajouter des `Suspense` partout).

### KPIs et composants

- `src/lib/kpis/<kpi>.ts` : fonctions **pures** de calcul, sans React, prenant les données typées par les schémas.
- `src/components/dashboard/<Kpi>.tsx` : composant client (`'use client'`) qui combine hook + fonction KPI et gère `Chargement...` / `Erreur de chargement`. Affichage via `KpiValue`, `ScoreGauge`, `CardList` ou Recharts, et `KpiDelta` pour l'évolution N-1.
- `KpiDelta` / `lib/comparison/evolution.ts` : prennent une `polarity` (`higher-is-better`, `lower-is-better`, `neutral`) et un `mode` (`relative` en % pour montants/volumes, `points` pour les KPIs qui sont déjà des taux). Les listes, le CAC et le ratio LTV/CAC n'affichent volontairement pas d'évolution.
- Les pages (`app/dashboard/*/page.tsx`) sont des composants serveur qui assemblent des `CardGroup` > `Card` > `CardTitle` + `CardContent` (`components/ui/Card.tsx`).

Ajouter un KPI = test puis fonction pure dans `lib/kpis/` (TDD), composant dans `components/dashboard/`, puis une `Card` dans la page concernée ; une nouvelle source de données demande en plus un schéma dans `schemas.ts`, un générateur, une route API et un hook.

### Style

Tailwind CSS v4, configuré dans `src/app/global.css` via `@theme` (pas de `tailwind.config`). Utiliser les tokens du thème sombre : `bg-surface`, `border-border`, `primary-*`, `secondary-*`, `text-success` / `text-danger` / `text-warning`. Nombres formatés avec `Intl.NumberFormat('fr-FR')`.
