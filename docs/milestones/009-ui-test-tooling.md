# Jalon 009 — Outillage de tests UI 🔄

Branche : `feature/ui-test-tooling` (depuis `develop`). Livré dans : —

## Objectif

Les composants React et les hooks se testent en TDD, comme la logique pure : `npm test` lance
les `*.test.ts` en environnement `node` et les `*.test.tsx` dans un DOM simulé, avec des tests
témoins pour un composant, les hooks de filtres et de données, deux routes API et les
générateurs de données mockées.

## Contexte

- Vitest tourne en environnement `node` et ne lit que les `*.test.ts` : le TDD s'arrête à
  `apps/web/src/lib`. Les 58 composants de `components/dashboard`, les 14 hooks de
  `lib/queries` et les 3 hooks de filtres d'URL ne sont pas testés, et les hooks sont même exclus
  de la couverture. `CLAUDE.md` contourne en extrayant leur logique dans des fonctions pures,
  mais le branchement n'est jamais vérifié : lecture de `?shop=`, `queryKey` stable, états de
  chargement et d'erreur, `previousValue` à `undefined` ou à `null`.
- La mémoïsation de `useDateRangeFilter` et de `useComparisonRange` évite des fetchs en boucle
  (`CLAUDE.md`) : aucun test ne la protège.
- Le jalon « Indicateurs côté serveur » réécrira tous les hooks pour charger des agrégats :
  `docs/roadmap.md` place cet outillage avant lui, pour réécrire sous filet.
- La phase 3 du jalon 001 (routes API, invariants du mock, `KpiDelta.tsx`) a été reportée ici.
- Pas de prérequis : jalon indépendant de la suite du backend, lancé avant « Modèle de données »
  sur décision de l'utilisateur.

## Décisions

- **D1 (2026-11-20) — Testing Library et jsdom** : `@testing-library/react` pour afficher les
  composants et exécuter les hooks (`render`, `renderHook`, `screen`), jsdom comme DOM simulé —
  décision de l'utilisateur. Testing Library teste ce que voit l'utilisateur plutôt que
  l'implémentation, et ses tests survivent aux refactors ; jsdom est le DOM simulé le plus
  complet et le plus documenté. Alternatives écartées :
  - happy-dom : plus rapide, mais moins fidèle ; interchangeable en une ligne si la vitesse
    devient gênante ;
  - Vitest Browser Mode (vrai navigateur) : fidélité totale, mais navigateurs à installer en
    local et dans le CI pour un gain limité aux graphiques ;
  - `react-test-renderer` (déprécié depuis React 19) et Enzyme (abandonné, sans React 18 ni 19) ;
  - les tests de bout en bout (Playwright, Cypress) sont complémentaires, pas une alternative :
    hors périmètre.
- **D2 (2026-11-20) — Deux `projects` Vitest** : `unit` (`src/**/*.test.ts`, environnement
  `node`) et `dom` (`src/**/*.test.tsx`, environnement `jsdom`), dans `vitest.config.mts` —
  l'environnement suit l'extension du fichier, sans commentaire par fichier ; les tests sans DOM
  (logique pure, routes API) gardent la vitesse de `node`. Les commandes ne changent pas.
- **D3 (2026-11-20) — Configuration minimale** : imports explicites conservés (pas de
  `globals: true`), donc le nettoyage du DOM après chaque test (`cleanup`) est déclaré dans un
  fichier de setup du projet `dom` ; pas de `@testing-library/jest-dom` : les assertions de
  Vitest suffisent (`getByText` échoue si le texte manque, `toBeNull`, `className`,
  `textContent`). Il s'ajoutera si les tests deviennent pénibles à lire.
- **D4 (2026-11-20) — Doubles de test** :
  - `next/navigation` remplacé par `vi.mock` : `useSearchParams` renvoie un `URLSearchParams`
    choisi par le test ;
  - `fetch` remplacé par `vi.stubGlobal`, sans MSW : une dépendance de moins, et les hooks
    n'appellent que `fetch` ;
  - un `QueryClient` neuf par test, `retry: false`, fourni par un `wrapper` : aucun cache ni
    nouvelle tentative partagés entre tests ;
  - les helpers vivent dans `src/lib/testing/`, à côté des builders.
- **D5 (2026-11-20) — Tests de caractérisation** : les tests du jalon portent sur du code
  existant et passent donc au vert d'emblée. Leur rouge se prouve par une mutation temporaire du
  code testé (retrait du `useMemo`, inversion d'un filtre…), lancée et montrée, puis annulée
  sans être commitée — un test qui n'a jamais échoué ne prouve rien.
- **D6 (2026-11-20) — Périmètre témoin** : pas de couverture rétroactive des 58 composants ni
  des 14 hooks ; un témoin par type de code, et les autres se testent quand on les touche (TDD).
  Routes API : `orders` (filtres faits à la main) et `analytics/traffic` (filtres de
  `analyticsReports`) ; les routes des commandes disparaîtront au jalon « Indicateurs côté
  serveur ».
- **D7 (2026-11-20) — Couverture** : étendue à `src/components/**` ; exclusions de
  `src/lib/queries/**` et `src/lib/query/**` retirées, puisque les hooks deviennent testables.
  Toujours sans seuil : le rapport sert à repérer les trous.
- **D8 (2026-11-20) — Pas de release** : outillage et tests, sans effet visible pour
  l'utilisateur (`docs/gitflow.md`) ; le jalon part avec la prochaine release qui en a un.

## Phase A — Outillage et témoin composant ⬜

- [ ] `docs/stack.md` relu avant d'ajouter les dépendances (`CLAUDE.md`).
- [ ] `apps/web/package.json` : `jsdom`, `@testing-library/react` et `@testing-library/dom`
      (dépendance pair) en `devDependencies` (D1).
- [ ] `apps/web/vitest.config.mts` : projects `unit` et `dom` (D2), setup du projet `dom` (D3),
      couverture (D7). Les 620 tests existants passent toujours, dans le projet `unit`.
- [ ] `apps/web/src/lib/testing/setupDom.ts` : `cleanup` après chaque test (D3).
- [ ] `apps/web/src/lib/testing/react.tsx` : `createTestQueryClient()` et
      `createQueryWrapper()` (D4).
- [ ] `apps/web/src/components/dashboard/KpiDelta.test.tsx` : rien d'affiché sans comparaison
      (`previous` à `undefined`) ni sans valeur courante (`current` à `null`) ; tiret et texte
      « indisponible » quand `previous` vaut `null` ; hausse d'un KPI `higher-is-better` en
      `text-success` avec le texte lecteur d'écran « en hausse de … % » ; baisse d'un KPI
      `lower-is-better` en `text-success` ; unité « pt » en mode `points`.

## Phase B — Hooks ⬜

- [ ] `apps/web/src/lib/filters/useDateRangeFilter.test.tsx` (horloge figée par
      `vi.setSystemTime`) : `from` et `to` de l'URL repris tels quels ; preset invalide ou absent
      → preset par défaut ; même référence d'objet entre deux rendus aux paramètres inchangés
      (garde-fou de la boucle de fetch).
- [ ] `apps/web/src/lib/filters/useComparisonRange.test.tsx` : `undefined` sans `compare` ;
      plage N-1 avec `compare=yoy` ; même référence entre deux rendus.
- [ ] `apps/web/src/lib/queries/useOrders.test.tsx` : `fetch` appelé sur `/api/orders` avec
      `from`, `to` et la boutique lue dans `?shop=` ; aucun paramètre `shop` sans boutique ;
      données validées renvoyées ; `isError` sur une réponse HTTP en erreur et sur une réponse
      hors schéma ; aucun `fetch` avec `enabled: false`.
- [ ] `apps/web/src/lib/queries/useComparedKpi.test.tsx` : `previousValue` à `undefined` sans
      comparaison (et requête N-1 non lancée), à `null` tant que la période N-1 n'est pas
      chargée, calculé par la même fonction pure une fois chargée.

## Phase C — Routes API et invariants du mock ⬜

Reprise de la phase 3 du jalon 001, en environnement `node` (`*.test.ts`).

- [ ] `apps/web/src/app/api/orders/route.test.ts` : `GET(new NextRequest(url))` avec le store
      remplacé par `vi.mock` ; toutes les commandes sans paramètre ; filtre `shop` ; bornes
      `from` et `to` incluses ; réponse conforme à `OrderListSchema`.
- [ ] `apps/web/src/app/api/analytics/traffic/route.test.ts` : même principe, paramètres
      transmis à `filterTraffic` (boutique, plage, proratisation des jours partiels).
- [ ] `apps/web/src/lib/mock-data/generator.test.ts` : `generateDataset(now)` respecte
      `DatasetSchema` et donne le même résultat pour le même `now` ; `generateHistoryOrders`
      respecte `OrderListSchema`.
- [ ] `apps/web/src/lib/mock-data/analyticsGenerator.test.ts` : `generateAnalyticsDataset`
      respecte `AnalyticsDatasetSchema` et donne le même résultat pour les mêmes entrées, avec le
      réglage par défaut et avec `HISTORY_ANALYTICS_TUNING`.

## Phase D — Documentation ⬜

- [ ] `CLAUDE.md` :
  - commandes et tests : deux projects (`.ts` en `node`, `.tsx` en `jsdom`), couverture
    étendue ;
  - TDD : fin du contournement « tant que cet outillage n'est pas en place », doubles de test
    et helpers (D4), rouge d'un test de caractérisation prouvé par mutation (D5).
- [ ] `docs/stack.md` : rôle de Vitest étendu aux composants et aux hooks ; nouvelle entrée
      Testing Library et jsdom, avec les alternatives écartées de D1 (pourquoi validé par
      l'utilisateur).
- [ ] `docs/roadmap.md` : prérequis « Outillage de tests UI » du jalon « Indicateurs côté
      serveur » marqué comme rempli.
- [ ] `README.md` : badge Testing Library ajouté à côté de celui de Vitest, puisque la stack
      technique liste les technologies de test (`docs/readme.md`) ; rien d'autre à modifier
      (outillage).

## Journal

- 2026-11-20 : plan rédigé, en attente de validation. Couple Testing Library et jsdom choisi par
  l'utilisateur (D1). Taille estimée : environ 60 lignes de configuration et de helpers, 500 à
  550 lignes de tests, sous le seuil de 800 lignes par pull request.

## Workflow Git

- `docs:` pour ce plan (fichier du jalon, index de la roadmap) ;
- `chore:` pour l'outillage et le témoin `KpiDelta` (phase A) ;
- `test:` pour les hooks (phase B) ;
- `test:` pour les routes API et les invariants du mock (phase C) ;
- `docs:` pour la documentation (phase D) ;
- `docs:` pour clore le jalon.

Chaque phase se termine par un point d'arrêt de relecture. Merge par pull request une fois
`checks` au vert.

## Critères d'acceptation

- `npm test`, `npm run lint`, `npm run typecheck` et `npm run build` sans erreur en local.
- `npm test` lance les projects `unit` et `dom`, et les `*.test.tsx` tournent en `jsdom`.
- `npm run test:coverage` rapporte `src/components` et `src/lib/queries`.
- Pour chaque fichier de test ajouté, une mutation du code testé a fait échouer au moins un test
  (sortie montrée, D5).
- `checks` au vert sur la pull request de la branche.
- `CLAUDE.md` et `docs/stack.md` décrivent l'outillage ; plus aucune mention d'un TDD
  impossible sur les composants et les hooks.

## Bilan

<Rempli à la clôture.>
