# Roadmap SalesPulse

Jalons des développements en cours et à venir, un fichier par jalon dans `docs/milestones/`.
Version actuelle : **0.3.2**.

Légende : ⬜ à faire · 🔄 en cours · ✅ terminé

## En cours

- 🔄 [006 — Monorepo](milestones/006-monorepo.md)

## Terminés

- ✅ [005 — Vision et stack](milestones/005-vision-and-stack.md) — non publié
- ✅ [004 — Fichiers de jalons](milestones/004-milestone-files.md) — non publié
- ✅ [003 — Conventions partagées](milestones/003-shared-conventions.md) — non publié
- ✅ [002 — Correctifs de la revue de code](milestones/002-review-fixes.md) — v0.3.2
- ✅ [001 — Tests unitaires](milestones/001-unit-tests.md) — v0.3.2

## Jalons futurs

- ⬜ **Outillage de tests UI** (prérequis du TDD sur les composants et les hooks) :
  - jsdom + `@testing-library/react`, avec un environnement jsdom limité aux `*.test.tsx` et
    `include` Vitest étendu aux `.tsx` ;
  - hooks testés via `renderHook` avec un `QueryClient` de test ;
  - couverture étendue à `apps/web/src/components` ;
  - points repris de la phase 3 du jalon 001 : `KpiDelta.tsx`, routes API
    (`GET(new NextRequest(url))` avec le store mocké via `vi.mock`), invariants du mock
    (`generateDataset` validé par `DatasetSchema.parse`).

Pistes relevées dans les commentaires du code, à valider et prioriser :

- ⬜ **Produits en déclin réels** : remplacer le placeholder aléatoire de
  `apps/web/src/lib/kpis/decliningProducts.ts` par une vraie comparaison entre la période courante et la
  période de comparaison.
- ⬜ **Comparaison à la période précédente** : ajouter un mode à `ComparisonMode`
  (`apps/web/src/lib/filters/comparisonRange.ts`), en plus du N-1.
- ⬜ **Backend réel** : remplacer les données mockées (`apps/web/src/lib/mock-data/store.ts`) par une
  vraie source de données, en plusieurs jalons après le monorepo (006) :
  - backend en TypeScript avec Express (décidé), dans `apps/api`, qui valide requêtes et
    réponses avec Zod ; schémas partagés via `packages/contracts` ;
  - périmètre du MVP : commandes (`Order`) et ce qui s'en déduit (clients, produits), avec tous
    les KPIs calculables à partir de cette seule source ; tout le reste de l'interface reste
    mocké tant que le MVP n'est pas prêt ;
  - données stockées dans PostgreSQL : Neon en production, base Docker en local ;
  - connecteurs aux plateformes e-commerce, WooCommerce en premier, puis Shopify et
    PrestaShop ;
  - déploiement (Render + Neon) et protection d'accès, les données clients étant des données
    personnelles.
- ⬜ **Analytics réel** : contexte distinct des commandes et des clients, qui demande une autre
  source de données (par exemple un connecteur Google). Trafic, pages, recherches, Web Vitals,
  e-mails, erreurs et dépenses publicitaires restent mockés tant que cette source n'existe pas,
  de même que les KPIs qui croisent analytics et commandes.

Pistes issues de `docs/vision.md` et `docs/stack.md`, à valider et prioriser :

- ⬜ **Authentification et rôles** : à concevoir avec le backend réel.
- ⬜ **Alertes et notifications** : prévenir l'utilisateur quand un indicateur sort de sa plage
  habituelle.
- ⬜ **Exports** : exporter les données ou les indicateurs affichés.
- ⬜ **Prévisions** : projeter les indicateurs sur la période à venir.
