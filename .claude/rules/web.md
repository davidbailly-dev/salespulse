---
paths:
  - "apps/web/**"
---

# Interface (`apps/web/`)

Règle chargée avec les fichiers d'`apps/web`. Sauf mention contraire, ses chemins `src/…` sont relatifs à `apps/web/`.

## Configuration

- `apps/web/next.config.ts` contient `agentRules: false` pour empêcher Next de générer/modifier `AGENTS.md` et `CLAUDE.md` : ne pas le retirer. Il déclare aussi `transpilePackages` pour `@salespulse/contracts`.

## Tests

- **Tests de `apps/web`** : Vitest (`apps/web/vitest.config.mts`) en deux projects, l'environnement suivant l'extension : `unit` pour les `*.test.ts` en `node` (logique pure, routes API, générateurs), `dom` pour les `*.test.tsx` en `jsdom` (composants et hooks). Couverture de `apps/web/src/lib/**` et `apps/web/src/components/**`, hors générateurs Faker (testés par invariants), sans seuil.
- Un seul fichier : `npm test -w @salespulse/web -- src/lib/kpis/revenue.test.ts` (chemin relatif à `apps/web`).
- Fixtures via les builders de `apps/web/src/lib/testing/builders.ts` (`buildOrder`, `buildTrafficRow`, … avec `overrides`), validés contre les schémas Zod par `builders.test.ts`.
- Générateurs Faker : invariants = respect du schéma Zod, même résultat pour les mêmes entrées (seed et `now` reçu, jamais l'horloge réelle), bornes des dates et cohérence entre champs.
- Composants et hooks : Testing Library (`render`, `renderHook`, `screen`), fichiers `*.test.tsx`, assertions de Vitest sans `jest-dom`. Doubles de test et helpers dans `apps/web/src/lib/testing/` :
  - `next/navigation` : `vi.mock('next/navigation', () => import('<chemin>/testing/nextNavigation'))`, puis l'URL lue par les hooks avec `setSearchParams('preset=7d&shop=…')`. Le double n'exporte que `useSearchParams` : l'étendre (`usePathname`, `useRouter`) au premier test d'un composant qui navigue (filtres, navigation) ;
  - `fetch` : `vi.stubGlobal('fetch', fetchMock)`, sans MSW, et `vi.unstubAllGlobals()` après chaque test ;
  - TanStack Query : `wrapper: createQueryWrapper()` (`testing/react.tsx`), un `QueryClient` neuf par test, sans nouvelle tentative ;
  - horloge : `vi.useFakeTimers({ toFake: ['Date'] })` puis `vi.setSystemTime(…)` ; ne simuler que `Date`, pour ne pas bloquer les minuteries de React et de TanStack Query.
- Routes API : `GET(new NextRequest(url))` dans le project `unit`, store remplacé par `vi.mock`. La validation Zod se prouve par un refus : une donnée hors contrat dans le store fait échouer la route.

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
- Les schémas Zod et types (`Order`, `TrafficRow`, …) vivent dans `packages/contracts/src/` (`@salespulse/contracts`) : format des routes de démonstration, partagé entre serveur et client. Ils diffèrent du modèle commun du backend ; les écarts et le jalon qui comble chacun sont listés dans `docs/domain-model.md`.
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

Ajouter un KPI = test puis fonction pure dans `lib/kpis/` (TDD), composant dans `components/dashboard/`, puis une `Card` dans la page concernée ; une nouvelle source de données demande en plus un schéma dans le fichier de son contexte de `packages/contracts/src/`, un générateur, une route API et un hook.

### Style

Tailwind CSS v4, configuré dans `apps/web/src/app/global.css` via `@theme` (pas de `tailwind.config`). Utiliser les tokens du thème sombre : `bg-surface`, `border-border`, `primary-*`, `secondary-*`, `text-success` / `text-danger` / `text-warning`. Nombres formatés avec `Intl.NumberFormat('fr-FR')`.
