---
paths:
  - "packages/contracts/**"
---

# Contrat entre l'API et l'interface (`packages/contracts/`)

Règle chargée avec les fichiers de `packages/contracts`.

- `@salespulse/contracts` est publié en TypeScript source, sans étape de build : Next le compile (`transpilePackages`). Il ne dépend que de `zod` ; le garder indépendant de React, de Next et de Faker.
- `@salespulse/contracts` porte le format échangé, pas les règles métier, qui font foi dans le domaine d'`apps/api`. Le web s'adapte au contrat, jamais au domaine.
- Nommage par usage (`RevenueKpi`, `TopProductItem`…), jamais le nom d'une entity du domaine. Les schémas actuels (`Order`, `Customer`, `Product`) gardent leur nom tant qu'ils servent la démo, et sont remplacés par des agrégats au jalon « Indicateurs côté serveur ».
- Un fichier par contexte, réexporté par `index.ts` : `shops.ts`, `sales.ts`, `analytics.ts`, et `demo.ts` pour les jeux de données du store mocké ; `shared.ts` naîtra avec le premier format commun à plusieurs contextes. `sales.ts` importe le canal et l'appareil d'`analytics.ts`, dépendance propre à la démo (jalon 010, D15).
- Tests : aucun tant qu'un schéma reste déclaratif ; un `.test.ts` colocalisé dès qu'il porte un invariant entre champs (`.refine`), une transformation (`.transform`) ou un enjeu de rétrocompatibilité. La correspondance entre les énumérations du contrat et celles du domaine se teste dans `apps/api`.
