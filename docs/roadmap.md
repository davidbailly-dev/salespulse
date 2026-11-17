# Roadmap SalesPulse

Jalons des développements en cours et à venir, un fichier par jalon dans `docs/milestones/`.
Version actuelle : **0.3.2**.

Légende : ⬜ à faire · 🔄 en cours · ✅ terminé

## En cours

- 🔄 [004 — Fichiers de jalons](milestones/004-milestone-files.md)

## Terminés

- ✅ [003 — Conventions partagées](milestones/003-shared-conventions.md) — non publié
- ✅ [002 — Correctifs de la revue de code](milestones/002-review-fixes.md) — v0.3.2
- ✅ [001 — Tests unitaires](milestones/001-unit-tests.md) — v0.3.2

## Jalons futurs

- ⬜ **Outillage de tests UI** (prérequis du TDD sur les composants et les hooks) :
  - jsdom + `@testing-library/react`, avec un environnement jsdom limité aux `*.test.tsx` et
    `include` Vitest étendu aux `.tsx` ;
  - hooks testés via `renderHook` avec un `QueryClient` de test ;
  - couverture étendue à `src/components` ;
  - points repris de la phase 3 du jalon 001 : `KpiDelta.tsx`, routes API
    (`GET(new NextRequest(url))` avec le store mocké via `vi.mock`), invariants du mock
    (`generateDataset` validé par `DatasetSchema.parse`).
- ⬜ **CHANGELOG** : `CHANGELOG.md` au format Keep a Changelog, en français, alimenté à chaque
  release à partir des Bilans des jalons livrés ; historique v0.1.0 à v0.3.2 reconstruit depuis
  `git log`.

Pistes relevées dans les commentaires du code, à valider et prioriser :

- ⬜ **Produits en déclin réels** : remplacer le placeholder aléatoire de
  `src/lib/kpis/decliningProducts.ts` par une vraie comparaison entre la période courante et la
  période de comparaison.
- ⬜ **Comparaison à la période précédente** : ajouter un mode à `ComparisonMode`
  (`src/lib/filters/comparisonRange.ts`), en plus du N-1.
- ⬜ **Backend réel** : remplacer les données mockées (`src/lib/mock-data/store.ts`) par une
  vraie source de données.
