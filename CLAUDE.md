# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

SalesPulse : dashboard Next.js de monitoring des ventes e-commerce multi-boutiques, en lecture seule ; l'UI et les libellés sont en français. Aujourd'hui alimenté par des données mockées côté serveur (trois boutiques fictives heroic fantasy), il est en transition vers un SaaS multi-commerçant qui synchronise de vraies boutiques (section « Backend, dans l'ordre » de `docs/roadmap.md`, décisions du jalon 007).
Vision, utilisateurs, non-objectifs et principes techniques : `docs/vision.md` (à lire avant de proposer une fonctionnalité).

## Commandes

Toutes les commandes se lancent **depuis la racine** du dépôt. `dev`, `build` et `start` sont délégués au paquet `@salespulse/web` ; `typecheck`, `test` et `test:coverage` parcourent chaque workspace qui a le script (`--workspaces --if-present`), donc le CI aussi.

```bash
npm install
npm run dev        # http://localhost:3000 (redirige vers /dashboard)
npm run build
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
- **Tests de `apps/web`** : Vitest (`apps/web/vitest.config.mts`) en deux projects, l'environnement suivant l'extension : `unit` pour les `*.test.ts` en `node` (logique pure, routes API, générateurs), `dom` pour les `*.test.tsx` en `jsdom` (composants et hooks). Couverture de `apps/web/src/lib/**` et `apps/web/src/components/**`, hors générateurs Faker (testés par invariants), sans seuil.
- **Tests de `apps/api`** : Vitest (`apps/api/vitest.config.mts`) en `node`, `*.test.ts` seulement. Couverture de `apps/api/src/**`, hors helpers de test (`src/testing/`), sans seuil.
- Les tests s'écrivent **avant** le code : voir « Conventions de développement ».
- `apps/web/next.config.ts` contient `agentRules: false` pour empêcher Next de générer/modifier `AGENTS.md` et `CLAUDE.md` : ne pas le retirer. Il déclare aussi `transpilePackages` pour `@salespulse/contracts`.
- TypeScript est en `strict: true` (options communes dans `tsconfig.base.json`).

## Structure du dépôt

Monorepo npm workspaces :

```
apps/web/            application Next.js (@salespulse/web) : interface et routes de démonstration
apps/api/            backend (@salespulse/api) : domaine, use cases et adapters, par bounded context
packages/contracts/  schémas Zod du format échangé entre l'API et l'interface (@salespulse/contracts)
docs/                documentation du projet (vision, stack, modèle du domaine, roadmap, jalons, conventions)
```

- **Sauf mention contraire, les chemins `src/…` de ce fichier sont relatifs à `apps/web/`** (la section « Architecture » les préfixe explicitement).
- Imports : relatifs à l'intérieur d'un paquet (pas d'alias `@/`), par nom de paquet entre paquets (`import { OrderSchema } from '@salespulse/contracts'`). Une app n'importe jamais depuis une autre : ce qu'elles partagent passe par un paquet.
- `apps/api` n'a encore ni serveur ni base : il est testé par le CI sans être déployé, Render lançant Next.js seul jusqu'au jalon « Déploiement du socle » (`docs/roadmap.md`).
- `@salespulse/contracts` est publié en TypeScript source, sans étape de build : Next le compile (`transpilePackages`). Il ne dépend que de `zod` ; le garder indépendant de React, de Next et de Faker. Son rôle et ses règles : « Contrat entre l'API et l'interface » ci-dessous.
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

- Lancer un seul fichier de test : `npm test -w <paquet> -- <chemin relatif au paquet>`.
- Fixtures via les builders de `apps/web/src/lib/testing/builders.ts` (`buildOrder`, `buildTrafficRow`, … avec `overrides`), validés contre les schémas Zod par `builders.test.ts`.
- Générateurs Faker : invariants = respect du schéma Zod, même résultat pour les mêmes entrées (seed et `now` reçu, jamais l'horloge réelle), bornes des dates et cohérence entre champs.
- Composants et hooks : Testing Library (`render`, `renderHook`, `screen`), fichiers `*.test.tsx`, assertions de Vitest sans `jest-dom`. Doubles de test et helpers dans `apps/web/src/lib/testing/` :
  - `next/navigation` : `vi.mock('next/navigation', () => import('<chemin>/testing/nextNavigation'))`, puis l'URL lue par les hooks avec `setSearchParams('preset=7d&shop=…')`. Le double n'exporte que `useSearchParams` : l'étendre (`usePathname`, `useRouter`) au premier test d'un composant qui navigue (filtres, navigation) ;
  - `fetch` : `vi.stubGlobal('fetch', fetchMock)`, sans MSW, et `vi.unstubAllGlobals()` après chaque test ;
  - TanStack Query : `wrapper: createQueryWrapper()` (`testing/react.tsx`), un `QueryClient` neuf par test, sans nouvelle tentative ;
  - horloge : `vi.useFakeTimers({ toFake: ['Date'] })` puis `vi.setSystemTime(…)` ; ne simuler que `Date`, pour ne pas bloquer les minuteries de React et de TanStack Query.
- Routes API : `GET(new NextRequest(url))` dans le project `unit`, store remplacé par `vi.mock`. La validation Zod se prouve par un refus : une donnée hors contrat dans le store fait échouer la route.
- Test de caractérisation (sur du code existant, donc vert d'emblée) : son rouge se prouve par une mutation temporaire du code testé, lancée et montrée, puis annulée sans être commitée. Une mutation qui survit révèle un test trop faible : le renforcer.
- `apps/api` :
  - value objects : une fonction de fabrique par value object, testée par ce qu'elle accepte et par le code de la `DomainError` de chaque refus, lu avec `errorCodeOf` (`apps/api/src/testing/`) ;
  - use cases : testés avec les adapters en mémoire (`InMemoryOrderRepository`…, dans `infrastructure/`), jamais avec une base ; les adapters de lecture SQL, contre une vraie PostgreSQL (`docs/domain-model.md`, « Écriture et lecture ») ;
  - fuseaux horaires : changements d'heure attendus choisis dans le passé, que les mises à jour de la base tz embarquée par Node ne changent pas, et vérifiés avec une seconde base, celle du système (`TZ=Europe/Paris date -d …`) ;
  - règle d'imports : une interdiction ajoutée à `eslint.config.mjs` se prouve par un import interdit temporaire qui fait échouer `npm run lint`, sortie montrée, puis retiré.

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

Les développements sont planifiés en jalons : un fichier par jalon dans `docs/milestones/`, indexés par `docs/roadmap.md`, selon un format générique partagé entre projets :

@docs/roadmap-conventions.md

Spécificités du projet :

- Les critères de validation incluent `npm test`, `npm run lint`, `npm run typecheck` et `npm run build` sans erreur, comme l'intégration continue.
- Chaque phase indique son niveau de relecture (voir « Relecture du code ») : `## Phase A — <nom> ⬜ (relecture critique)`.
- Le Journal ne note que ce que le reste du jalon ne dit pas : découvertes, surprises, points bloquants, changements de plan. L'avancement se lit dans les cases cochées et dans l'historique Git.

### Vision et stack

Le rôle et la tenue de `docs/vision.md` et de `docs/stack.md` sont décrits dans un fichier
générique partagé entre projets :

@docs/project-docs-conventions.md

`docs/vision.md` et `docs/stack.md` ne sont pas importés (lus à la demande) : lire `docs/stack.md`
avant d'ajouter, de remplacer ou de retirer une dépendance structurante.

## Architecture

### Backend (`apps/api/`)

Le modèle du domaine est décrit dans `docs/domain-model.md` (bounded contexts, entities, value objects, invariants, écriture et lecture, correspondance des statuts des plateformes) : le lire avant de toucher à `apps/api`. Les décisions et leurs raisons sont dans le jalon 010 (`docs/milestones/010-data-model.md`), citées par leur numéro (D3, D31…). L'essentiel au quotidien :

- Architecture hexagonale : `apps/api/src/<contexte>/{domain,application,infrastructure}` et un `index.ts` par contexte (`organizations`, `shops`, `sales`, `analytics`, `billing` à venir), plus un shared kernel `apps/api/src/shared/domain/` (`Money`, `CurrencyCode`, `IanaTimezone`, `LocalDay`, `DomainError`).
- Règle d'imports, vérifiée par `eslint.config.mjs` (`apiLayers`) : `domain/` n'importe que son dossier et `shared/domain/`, aucun paquet externe ; `application/` ajoute son domaine et l'`index.ts` d'un autre contexte, aucun paquet externe ; `infrastructure/` importe tout sauf l'intérieur d'un autre contexte. Les `*.test.ts` sont exemptés. Ses expressions régulières supposent `domain/` à plat (un fichier par entity ou value object, nommé en camelCase) : les revoir avec des sous-dossiers par aggregate.
- `domain/` est pur et déterministe : ni entrée/sortie, ni horloge (`now` en paramètre), ni bibliothèque. Les fuseaux horaires passent par `Intl`.
- Value objects : types en lecture seule et marqués (branded), produits par une fonction de fabrique qui vérifie l'invariant (`money()` produit un `Money`), sans classes ; une liste fermée de valeurs (`OrderStatus`) est une union de littéraux tirée d'un tableau figé, sans marque. Une valeur invalide lève une `DomainError` avec un code stable (`invalid-money`, `currency-mismatch`…).
- Les règles métier n'existent qu'une fois, en TypeScript : les champs dont la lecture a besoin (« compte dans les indicateurs », jour local, ventes nettes HT) sont calculés à l'écriture, et le SQL ne fait que filtrer, additionner et regrouper.

### Contrat entre l'API et l'interface (`packages/contracts/`)

- `@salespulse/contracts` porte le format échangé, pas les règles métier, qui font foi dans le domaine d'`apps/api`. Le web s'adapte au contrat, jamais au domaine.
- Nommage par usage (`RevenueKpi`, `TopProductItem`…), jamais le nom d'une entity du domaine. Les schémas actuels (`Order`, `Customer`, `Product`) gardent leur nom tant qu'ils servent la démo, et sont remplacés par des agrégats au jalon « Indicateurs côté serveur ».
- Un fichier par contexte, réexporté par `index.ts` : `shops.ts`, `sales.ts`, `analytics.ts`, et `demo.ts` pour les jeux de données du store mocké ; `shared.ts` naîtra avec le premier format commun à plusieurs contextes. `sales.ts` importe le canal et l'appareil d'`analytics.ts`, dépendance propre à la démo (jalon 010, D15).
- Tests : aucun tant qu'un schéma reste déclaratif ; un `.test.ts` colocalisé dès qu'il porte un invariant entre champs (`.refine`), une transformation (`.transform`) ou un enjeu de rétrocompatibilité. La correspondance entre les énumérations du contrat et celles du domaine se teste dans `apps/api`.

### Interface (`apps/web/`)

Flux de données d'un KPI, de bout en bout :

```
mock-data (singleton mémoire) → route API /api/... (filtre + Zod) → hook TanStack Query (lit ?shop=, Zod) → fonction KPI pure (lib/kpis) → composant client (components/dashboard) → Card dans une page (app/dashboard/*)
```

#### Données mockées (`apps/web/src/lib/mock-data/`)

- `store.ts` génère le jeu de données **une seule fois par démarrage du serveur** (déclenché par `apps/web/src/instrumentation.ts`) et le garde en mémoire : `getDataset()` (boutiques, produits, clients, commandes) et `getAnalyticsDataset()` (trafic, pages vues, recherches, dépenses pub, Web Vitals, erreurs, e-mails).
- Deux fenêtres de `WINDOW_DAYS` (90) jours sont générées : la fenêtre actuelle (`generator.ts`) et la fenêtre **N-1** un an plus tôt (`historyGenerator.ts` + `HISTORY_ANALYTICS_TUNING` dans `analyticsTuning.ts`), avec des tendances volontairement mixtes (hausses/baisses) pour la comparaison. Les deux fenêtres sont exposées ensemble ; c'est la plage de dates de la requête qui les distingue.
- Génération **déterministe** : chaque générateur a son propre seed (`SEED`, `ATTRIBUTION_SEED`, `HISTORY_SEED`, etc.), souvent via une instance `SimpleFaker` dédiée. Ajouter un tirage aléatoire dans un générateur existant décale toute la séquence et change toutes les données (donc tous les KPIs déjà calibrés) : pour un nouveau champ aléatoire, utiliser une instance Faker séparée avec son propre seed, comme `attributionFaker`.
- Les boutiques et leur poids / tendance N-1 sont dans `SHOP_CONFIGS` (`generator.ts`). Leurs `id` sont des slugs stables car ils apparaissent dans l'URL.
- Les schémas Zod et types (`Order`, `TrafficRow`, …) vivent dans `packages/contracts/src/` (`@salespulse/contracts`) : format des routes de démonstration, partagé entre serveur et client. Ils diffèrent du modèle commun du backend ; les écarts et le jalon qui comble chacun sont listés dans `docs/domain-model.md`.
- `analyticsReports.ts` filtre/agrège les données analytics côté serveur. Les lignes analytics sont journalières alors que `from`/`to` sont des instants : les jours partiellement couverts sont **proratisés** (voir le commentaire de tête du fichier). Réutiliser ces fonctions pour toute nouvelle route analytics plutôt que de filtrer à la main.

#### Routes API (`apps/web/src/app/api/`)

`orders`, `products`, `customers`, `shops`, et `analytics/<rapport>`. Chaque route lit `from`, `to`, `shop` en query params (sans `shop` = toutes les boutiques ; dates ISO 8601, donc comparaison lexicographique) et valide la réponse avec le schéma Zod de liste correspondant. `products` et `customers` ignorent la plage de dates.

#### Hooks de données (`apps/web/src/lib/queries/`)

- Un hook par source (`useOrders`, `useTraffic`, `useAdSpend`, …), signature `(dateRange?, { enabled? })`. **La boutique est lue dans le hook** via `useShopFilter()`, pas passée par les composants. Les URLs analytics passent par `buildAnalyticsUrl()`. La réponse est re-validée avec Zod côté client.
- `useOrders()` sans plage = tout l'historique (utilisé par exemple par le CAC pour déterminer la première commande d'un client) ; passer `enabled: false` pour désactiver une requête, jamais une plage `undefined`.
- `useComparedKpi(useData, calculate)` / `useComparedKpi2(...)` : appliquent la même fonction KPI pure à la période courante et à la période N-1. `previousValue` vaut `undefined` si la comparaison est désactivée, `null` si elle est active mais indisponible.

#### Filtres globaux dans l'URL (`apps/web/src/lib/filters/`)

Tout l'état global est en query params, conservé lors de la navigation :
- `?shop=<id>` → `useShopFilter()`
- `?preset=7d|30d|90d|month|lastMonth` ou `?from=&to=` → `useDateRangeFilter()` (défaut `30d`)
- `?compare=yoy` → `useComparisonMode()` / `useComparisonRange()`

`useDateRangeFilter` et `useComparisonRange` sont mémoïsés exprès : les presets dépendent de `new Date()`, et une nouvelle plage à chaque rendu changerait la `queryKey` et relancerait les fetchs en boucle. Conserver cette mémoïsation pour tout nouveau hook dérivé.

Comme ces filtres utilisent `useSearchParams`, `app/dashboard/layout.tsx` appelle `await connection()` pour exclure tout le dashboard du pré-rendu statique (au lieu d'ajouter des `Suspense` partout).

#### KPIs et composants

- `apps/web/src/lib/kpis/<kpi>.ts` : fonctions **pures** de calcul, sans React, prenant les données typées par les schémas.
- `apps/web/src/components/dashboard/<Kpi>.tsx` : composant client (`'use client'`) qui combine hook + fonction KPI et gère `Chargement...` / `Erreur de chargement`. Affichage via `KpiValue`, `ScoreGauge`, `CardList` ou Recharts, et `KpiDelta` pour l'évolution N-1.
- `KpiDelta` / `lib/comparison/evolution.ts` : prennent une `polarity` (`higher-is-better`, `lower-is-better`, `neutral`) et un `mode` (`relative` en % pour montants/volumes, `points` pour les KPIs qui sont déjà des taux). Les listes, le CAC et le ratio LTV/CAC n'affichent volontairement pas d'évolution.
- Les pages (`app/dashboard/*/page.tsx`) sont des composants serveur qui assemblent des `CardGroup` > `Card` > `CardTitle` + `CardContent` (`components/ui/Card.tsx`).

Ajouter un KPI = test puis fonction pure dans `lib/kpis/` (TDD), composant dans `components/dashboard/`, puis une `Card` dans la page concernée ; une nouvelle source de données demande en plus un schéma dans le fichier de son contexte de `packages/contracts/src/`, un générateur, une route API et un hook.

#### Style

Tailwind CSS v4, configuré dans `apps/web/src/app/global.css` via `@theme` (pas de `tailwind.config`). Utiliser les tokens du thème sombre : `bg-surface`, `border-border`, `primary-*`, `secondary-*`, `text-success` / `text-danger` / `text-warning`. Nombres formatés avec `Intl.NumberFormat('fr-FR')`.
