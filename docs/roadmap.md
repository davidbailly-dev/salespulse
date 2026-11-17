# Roadmap SalesPulse

Jalons des développements en cours et à venir. Version actuelle : **0.3.1**.

Légende : ⬜ à faire · 🔄 en cours · ✅ terminé

---

## Jalon en cours — Tests unitaires 🔄

Branche : `feature/unit-tests` (depuis `develop`).

### Contexte

SalesPulse n'a aucun test. Le script `"test": "npm test"` du `package.json` s'appelle lui-même
en boucle (bug à corriger). Le cœur métier est déjà isolé dans des **fonctions pures**
(`src/lib/kpis/*`, ~50 fichiers, `src/lib/comparison`, `src/lib/dates`, `src/lib/filters`,
`src/lib/mock-data/analyticsReports.ts`), souvent avec des cas limites documentés en commentaire
(division par zéro, `null` vs 0, années bissextiles, prorata de journée, seuils de
négligeabilité). Objectif : verrouiller ces règles métier par des tests rapides et
déterministes, sans tester l'UI au-delà du strict utile.

Le ROI est élevé sur `src/lib` (pur, sans dépendances, logique subtile, `strict: false` dans le
tsconfig donc peu de filet du typeur). Il est faible sur les composants
`components/dashboard/*` (simple affichage d'un calcul déjà testé), les hooks TanStack (fins
wrappers) et les générateurs Faker (aléatoires).

### Outillage

- **Vitest** + `@vitest/coverage-v8` (TS/ESM natif, aucune config Babel, recommandé par Next).
- Environnement `node` (pas de jsdom pour les phases 1 et 2).
- `vitest.config.mts` : `include: ['src/**/*.test.ts']`, coverage limitée à `src/lib/**`
  (hors `mock-data/*Generator.ts`, `queries/`, `query/`).
- Scripts `package.json` : `"test": "vitest run"`, `"test:watch": "vitest"`,
  `"test:coverage": "vitest run --coverage"` (corrige la récursion).
- Tests **colocalisés** : `src/lib/kpis/revenue.test.ts` à côté de `revenue.ts`.
- Builders de fixtures partagés : `src/lib/testing/builders.ts` (`buildOrder`, `buildProduct`,
  `buildCustomer`, `buildTrafficRow`, … avec `overrides`), typés via les types Zod de
  `src/lib/mock-data/schemas.ts`. Dates ISO fixes, aucun `Math.random`.

### Phase 0 — Mise en place ⬜

- [ ] Installer Vitest et la couverture v8
- [ ] Créer `vitest.config.mts`
- [ ] Corriger les scripts `test` du `package.json`
- [ ] Créer les builders de fixtures

### Phase 1 — Logique transverse (le plus critique) ⬜

- [ ] `src/lib/comparison/evolution.ts` : modes `relative`/`points`, `previous === 0` → `null`,
      seuils `NEGLIGIBLE_*` (juste sous / pile au seuil), polarités, arrondi à 1 décimale,
      `previous` négatif (`Math.abs`).
- [ ] `src/lib/dates/subtractOneYear.ts` : cas standard, 29 février → 1er mars, enjambement
      bissextile.
- [ ] `src/lib/filters/dateRangePresets.ts` : chaque preset avec `now` injecté, `lastMonth` en
      janvier (année précédente), mars bissextile/non bissextile (fin février), `isValidPreset`.
- [ ] `src/lib/filters/comparisonRange.ts` : bornes absentes, décalage N-1,
      `isValidComparisonMode`.
- [ ] `src/lib/mock-data/analyticsReports.ts` : `createDayWeight` via `filterTraffic` & co —
      prorata côté `from`, jour de `to` entier, filtre boutique, conservation des inégalités
      (`engagedSessions <= sessions`) après arrondi.

### Phase 2 — KPIs (`src/lib/kpis/*`) ⬜

Un fichier de test par KPI, schéma commun : liste vide, uniquement des statuts non
`completed`, cas nominal calculé à la main, arrondi, valeur sentinelle (`null` / 0).

Points d'attention :

- [ ] `revenue.ts` : `sumCompletedRevenue` non arrondi vs `calculateRevenue` arrondi.
- [ ] `averageTimeBetweenOrders.ts` : `null` sans écart, moyenne des écarts (pas de moyennes).
- [ ] `customerAcquisitionCost.ts` : première commande hors période, `null` sans nouveau client.
- [ ] `salesConcentration.ts` : produits invendus inclus, `topShare`, `Math.max(1, …)`.
- [ ] `customerRevenueSegments.ts` : bornes `[min, max)` (500 tombe dans « 500 - 1500€ »).
- [ ] `webVitals.ts` : `rateWebVital` aux seuils exacts, pondération par `samples`, CLS à
      3 décimales.
- [ ] Autres KPIs selon le schéma commun.

Exclu : `decliningProducts.ts` (placeholder aléatoire assumé).

### Phase 3 — Optionnelle ⬜

- [ ] Routes API (`src/app/api/**/route.ts`) : appel direct de `GET(new NextRequest(url))` avec
      `store` mocké via `vi.mock` — filtres `shop` / `from` / `to`.
- [ ] Test d'invariants du mock : `generateDataset` validé par `DatasetSchema.parse` (garantit
      que le mock respecte toujours son contrat Zod).
- [ ] `KpiDelta.tsx` avec Testing Library + jsdom (seul composant avec de la logique
      d'affichage).

### Workflow Git

Commits Conventional Commits en français, un par phase (`chore: installe vitest…`,
`test: couvre le calcul d'évolution…`, `test: couvre les KPIs…`).

### Critères de validation

- `npm test` : tous les tests passent, exécution en quelques secondes.
- `npm run test:coverage` : couverture de `src/lib/kpis`, `comparison`, `dates`, `filters`
  proche de 100 % en lignes/branches.
- `npm run lint` et `npx tsc --noEmit` sans nouvelle erreur.
- Sanity check : casser volontairement une règle (ex. seuil de `calculateEvolution`) et
  vérifier qu'au moins un test échoue.

---

## Jalons futurs

Pistes relevées dans les commentaires du code, à valider et prioriser :

- ⬜ **Produits en déclin réels** : remplacer le placeholder aléatoire de
  `src/lib/kpis/decliningProducts.ts` par une vraie comparaison entre la période courante et la
  période de comparaison.
- ⬜ **Comparaison à la période précédente** : ajouter un mode à `ComparisonMode`
  (`src/lib/filters/comparisonRange.ts`), en plus du N-1.
- ⬜ **Backend réel** : remplacer les données mockées (`src/lib/mock-data/store.ts`) par une
  vraie source de données.
