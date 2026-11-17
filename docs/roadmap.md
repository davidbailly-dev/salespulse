# Roadmap SalesPulse

Jalons des développements en cours et à venir. Version actuelle : **0.3.2**.

Légende : ⬜ à faire · 🔄 en cours · ✅ terminé

---

## Jalon terminé — Conventions partagées ✅

Branche : `feature/shared-conventions` (depuis `develop`), mergée dans `develop`.

### Contexte

`docs/gitflow.md` a fixé un schéma de réutilisation entre projets : un fichier **générique**,
copiable tel quel, importé par `@docs/<fichier>.md` dans le `CLAUDE.md` du projet, avec les
spécificités du projet à côté de l'import. Trois autres blocs de règles sont aujourd'hui
mélangés à du contenu propre à SalesPulse ou ne sont écrits nulle part :

- le TDD, dans la section « Conventions de développement » du `CLAUDE.md` ;
- le format de cette roadmap, implicite ;
- les conventions de commit, dans le `CLAUDE.md` global et dans la pratique de `git log`.

Décisions :

- **Fichiers autonomes** : chaque fichier se suffit à lui-même, on peut n'en copier qu'un.
- **Aucune référence au projet** : ni SalesPulse, ni Next.js, Vitest, npm, Zod ou chemin `src/…`.
- **Règles personnelles hors des fichiers** : « pas de Co-Authored-By » et « pas de commit ni de
  push sans confirmation » restent dans le `CLAUDE.md` global, car elles portent sur le travail
  avec Claude et non sur le projet.

### Phase A — Fichiers génériques ✅

- [x] `docs/tdd.md` : cycle rouge → vert → refactor, règles (bug = test qui le reproduit, test
      et code dans le même commit, exceptions), extraction en fonction pure, pratiques de test
      (colocalisation, builders déterministes, tests d'invariants pour l'aléatoire).
- [x] `docs/roadmap-conventions.md` : structure du fichier roadmap et d'un jalon, cycle de vie
      d'un jalon, modèle de jalon vide.
- [x] `docs/commits.md` : format Conventional Commits en français, types, granularité.

### Phase B — Branchement dans le projet ✅

- [x] `CLAUDE.md` : importer les trois fichiers, ne garder à côté que les spécificités du projet
      (commande Vitest, builders, schémas Zod, exception de l'outillage UI) et retirer les
      doublons de la section « Commandes ».
- [x] `~/.claude/CLAUDE.md` (hors repo) : la règle Conventional Commits renvoie vers
      `docs/commits.md` quand il existe.

### Workflow Git

Un `docs:` pour ce plan, un `docs:` par fichier générique (avec le branchement correspondant
dans `CLAUDE.md`), puis un `docs:` pour clore le jalon.

### Critères de validation

- `grep -niE "salespulse|next|vitest|npm|zod|src/"` ne trouve rien dans les trois fichiers.
- Le `CLAUDE.md` du projet ne répète plus le contenu des fichiers importés.
- Cette roadmap respecte `docs/roadmap-conventions.md`.
- Les imports `@docs/…` sont chargés dans une nouvelle session (`/memory`).

### Bilan

- Trois fichiers génériques créés, en plus de `docs/gitflow.md` : `docs/tdd.md`,
  `docs/roadmap-conventions.md` et `docs/commits.md`. Le grep de validation ne trouve aucune
  référence au projet.
- Le `CLAUDE.md` importe désormais quatre fichiers `@docs/…` et ne garde que les spécificités :
  commande Vitest, builders, schémas Zod, exception de l'outillage UI, commandes de validation,
  fichiers qui portent la version.
- `docs/tdd.md` va plus loin que l'ancienne section du `CLAUDE.md` : pratiques de test
  (déterminisme, cas limites, noms de tests) et règles pour un agent IA, tirées de la pratique
  des jalons précédents.
- `docs/commits.md` documente le style réellement suivi dans `git log` (présent de l'indicatif à
  la 3ᵉ personne, sans portée), qui n'était écrit nulle part. Ses exemples ont été réécrits pour
  ne plus citer de KPIs du projet.
- Ce jalon est le premier écrit selon `docs/roadmap-conventions.md`.
- Reste à vérifier dans une nouvelle session (`/memory`) que les quatre imports sont chargés.

---

## Jalon terminé — Correctifs de la revue de code ✅

Branche : `feature/review-fixes` (depuis `develop`).

### Contexte

La revue de code du jalon « Tests unitaires » (2026-11-17) n'a trouvé aucun bug introduit en
production, mais 9 points : 4 comportements douteux du code existant que les tests figent, une
erreur dans la configuration de couverture, et 4 tests mal nommés ou fixtures trompeuses.

Décisions :

- **Borne `to` des analytics** : le jour qui commence pile à `to` est exclu. Le jour qui contient
  `to` reste compté entier, ce qui n'est exact que si `to` = maintenant ou fin de journée. Ce sont
  les seuls cas que produit l'UI, donc c'est documenté comme limite connue. Un prorata exact
  demanderait de connaître la couverture réelle de chaque ligne (via `generatedAt`).
- **Arrondi des évolutions** : il devient symétrique (±0,25 → ±0,3), alors que `Math.round`
  arrondit les ,5 vers +∞.
- **TDD** : le Test Driven Development devient une convention du projet (section
  « Conventions de développement » du `CLAUDE.md`), pour tout le code. Ce jalon l'applique déjà :
  chaque correctif commence par un test qui échoue.

### Phase A — Comportements métier ✅

- [x] `src/lib/comparison/evolution.ts` : le seuil de négligeabilité est comparé à la valeur
      **arrondie affichée** et non au flottant brut (`0.3 - 0.2` donne `0.0999…`, donc gris,
      alors que `2.2 - 2.1` donne vert pour le même « +0,1 pt » affiché). L'arrondi devient
      symétrique. Conséquence assumée : en relatif, 0,45 à 0,49 % s'affiche « 0,5 % » et n'est
      plus gris. Ajouter des tests à la limite exacts (`±1,25 → ±1,3` en mode points).
- [x] `src/lib/mock-data/analyticsReports.ts` (`createDayWeight`) : exclure le jour qui commence
      pile à `to` (`dayStart >= toTime`). Documenter la limite du jour de `to` compté entier
      dans le commentaire de tête et dans les noms des tests.
- [x] `src/lib/dates/subtractOneYear.ts` : le 29 février recule au **28 février** (et non au
      1er mars), pour que la plage N-1 de « février » ne déborde pas sur mars. Mettre à jour
      `subtractOneYear.test.ts` et `comparisonRange.test.ts`. Le mock utilise la même fonction,
      donc l'alignement est conservé.

### Phase B — Tests et fixtures ✅

- [x] `averageTimeBetweenOrders.test.ts` : tester réellement un écart de moins d'un jour (12 h
      → 1), qu'une troncature en jours entiers ferait échouer.
- [x] `subtractOneYear.test.ts` : renommer « recule vers un 29 février… », qui vérifie en fait
      un 28 février.
- [x] `src/lib/testing/builders.ts` : `buildPageViewRow` / `buildPageStat` ne gardent
      `productId` que pour une page de type `product`. Écrire d'abord le cas dans
      `builders.test.ts` (TDD).

### Phase C — Configuration ✅

- [x] `vitest.config.mts` : le motif d'exclusion `*Generator.ts` est sensible à la casse et ne
      couvre pas `generator.ts`. Passer à `*[gG]enerator.ts`.

### Workflow Git

Chaque correctif de la phase A suit le cycle TDD :

1. **Rouge** : modifier ou ajouter le test qui décrit le comportement attendu, puis vérifier
   qu'il échoue pour la bonne raison.
2. **Vert** : corriger le code, puis vérifier que toute la suite passe.
3. Le test et le correctif vont dans le même commit `fix:`.

Commits Conventional Commits en français : un `docs:` pour la convention TDD (`CLAUDE.md`), un
`docs:` pour ce plan, un `fix:` par correctif de la phase A, un `test:` pour les phases B et C,
puis un `docs:` pour clore le jalon.

### Critères de validation

- `npm test`, `npm run lint` et `npx tsc --noEmit` sans erreur.
- `npm run test:coverage` : `generator.ts` n'apparaît plus dans le rapport.
- TDD : le test de chaque correctif (phase A et `productId`) a été vu en échec avant le
  correctif.
- `/dashboard?compare=yoy` : les deltas N-1 s'affichent normalement.

### Bilan

- Les 4 correctifs écrits en TDD ont tous été vus en échec avant d'être corrigés. Les tests
  sont passés de 604 à 620, et `tsc` et `eslint` ne remontent rien.
- La phase rouge d'A1 a révélé un défaut absent de la revue : une baisse infime renvoyait
  `-0`, affiché « −0,0 ». C'est corrigé dans le même commit.
- La revue citait un type de page `category`, qui n'existe pas (`PageType` vaut `product` ou
  `other`). Le test du builder utilise donc `other`.
- Vérification visuelle sur les 5 pages avec `?compare=yoy` : 32 deltas N-1, aucun état de
  chargement ou d'erreur, aucun `−0,0`.

---

## Jalon terminé — Tests unitaires ✅

Branche : `feature/unit-tests` (depuis `develop`), mergée dans `develop`.

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

### Phase 0 — Mise en place ✅

- [x] Installer Vitest et la couverture v8
- [x] Créer `vitest.config.mts`
- [x] Corriger les scripts `test` du `package.json`
- [x] Créer les builders de fixtures (+ `builders.test.ts` qui les valide contre les schémas Zod)
- [x] Exclure `coverage/**` du lint

### Phase 1 — Logique transverse (le plus critique) ✅

- [x] `src/lib/comparison/evolution.ts` : modes `relative`/`points`, `previous === 0` → `null`,
      seuils `NEGLIGIBLE_*` (juste sous / pile au seuil), polarités, arrondi à 1 décimale,
      `previous` négatif (`Math.abs`).
- [x] `src/lib/dates/subtractOneYear.ts` : cas standard, 29 février → 1er mars, enjambement
      bissextile.
- [x] `src/lib/filters/dateRangePresets.ts` : chaque preset avec `now` injecté, `lastMonth` en
      janvier (année précédente), mars bissextile/non bissextile (fin février), `isValidPreset`.
- [x] `src/lib/filters/comparisonRange.ts` : bornes absentes, décalage N-1,
      `isValidComparisonMode`.
- [x] `src/lib/mock-data/analyticsReports.ts` : `createDayWeight` via `filterTraffic` & co —
      prorata côté `from`, jour de `to` entier, filtre boutique, conservation des inégalités
      (`engagedSessions <= sessions`) après arrondi.

### Phase 2 — KPIs (`src/lib/kpis/*`) ✅

Un fichier de test par KPI, schéma commun : liste vide, uniquement des statuts non
`completed`, cas nominal calculé à la main, arrondi, valeur sentinelle (`null` / 0).

Points d'attention :

- [x] `revenue.ts` : `sumCompletedRevenue` non arrondi vs `calculateRevenue` arrondi.
- [x] `averageTimeBetweenOrders.ts` : `null` sans écart, moyenne des écarts (pas de moyennes).
- [x] `customerAcquisitionCost.ts` : première commande hors période, `null` sans nouveau client.
- [x] `salesConcentration.ts` : produits invendus inclus, `topShare`, `Math.max(1, …)`.
- [x] `customerRevenueSegments.ts` : bornes `[min, max)` (500 tombe dans « 500 - 1500€ »).
- [x] `webVitals.ts` : `rateWebVital` aux seuils exacts, pondération par `samples`, CLS à
      3 décimales.
- [x] Autres KPIs selon le schéma commun.

Livrée en 6 commits, un par famille de KPI : ventes, clients, produits et catalogue, trafic
et engagement, acquisition et marketing, qualité du site et recherche.

Exclu : `decliningProducts.ts` (placeholder aléatoire assumé).

### Phase 3 — Optionnelle ⬜ (reprise dans le jalon futur « Outillage de tests UI »)

Avec l'adoption du TDD pour tout le code, cette phase n'est plus optionnelle : elle est
reprise et complétée dans les jalons futurs.

- [ ] Routes API (`src/app/api/**/route.ts`) : appel direct de `GET(new NextRequest(url))` avec
      `store` mocké via `vi.mock` — filtres `shop` / `from` / `to`.
- [ ] Test d'invariants du mock : `generateDataset` validé par `DatasetSchema.parse` (garantit
      que le mock respecte toujours son contrat Zod).
- [ ] `KpiDelta.tsx` avec Testing Library + jsdom (seul composant avec de la logique
      d'affichage).

### Workflow Git

Commits Conventional Commits en français, un par phase (`chore: installe vitest…`,
`test: couvre la logique transverse…`), sauf la phase 2 découpée en un commit par famille de
KPI (`test: couvre les KPIs de ventes`, `…clients`, etc.).

### Critères de validation

- `npm test` : tous les tests passent, exécution en quelques secondes.
- `npm run test:coverage` : couverture de `src/lib/kpis`, `comparison`, `dates`, `filters`
  proche de 100 % en lignes/branches.
- `npm run lint` et `npx tsc --noEmit` sans nouvelle erreur.
- Sanity check : casser volontairement une règle (ex. seuil de `calculateEvolution`) et
  vérifier qu'au moins un test échoue.

---

## Jalons futurs

- ⬜ **Outillage de tests UI** (prérequis du TDD sur les composants et les hooks) :
  - jsdom + `@testing-library/react`, avec un environnement jsdom limité aux `*.test.tsx` et
    `include` Vitest étendu aux `.tsx` ;
  - hooks testés via `renderHook` avec un `QueryClient` de test ;
  - couverture étendue à `src/components` ;
  - points repris de la phase 3 des tests unitaires : `KpiDelta.tsx`, routes API
    (`GET(new NextRequest(url))` avec le store mocké via `vi.mock`), invariants du mock
    (`generateDataset` validé par `DatasetSchema.parse`).

Pistes relevées dans les commentaires du code, à valider et prioriser :

- ⬜ **Produits en déclin réels** : remplacer le placeholder aléatoire de
  `src/lib/kpis/decliningProducts.ts` par une vraie comparaison entre la période courante et la
  période de comparaison.
- ⬜ **Comparaison à la période précédente** : ajouter un mode à `ComparisonMode`
  (`src/lib/filters/comparisonRange.ts`), en plus du N-1.
- ⬜ **Backend réel** : remplacer les données mockées (`src/lib/mock-data/store.ts`) par une
  vraie source de données.
