# Jalon 010 — Modèle de données 🔄

Branche : `feature/data-model` (depuis `develop`). Livré dans : —

## Objectif

Les définitions métier sont tranchées (statuts, chiffre d'affaires, remboursements, fuseau
horaire), et `docs/domain-model.md` décrit le modèle commun du backend : bounded contexts,
entities, value objects et invariants, prêts à devenir des tables au jalon « Base de données ».
Les value objects dont les règles sont délicates (montants, statuts, jours locaux) existent en
TypeScript pur dans le cœur hexagonal d'`apps/api`, testés en TDD.

## Contexte

- Le jalon 007 a fixé le produit visé (SaaS multi-commerçant) et plusieurs contraintes du
  modèle : organisation propriétaire de chaque donnée (D1, P11), client pseudonymisé (D7, P15),
  montants en unités mineures avec leur devise et devise de référence à l'euro (D17, P9),
  boutiques hors euros refusées (D11). Il a laissé ouverts les définitions métier et le fuseau
  horaire, rattachés à ce jalon lors du découpage du socle en quatre jalons.
- Le modèle actuel est celui des données mockées (`packages/contracts/src/schemas.ts`) :
  montants en euros décimaux (`totalAmount`, `unitPrice`), trois statuts (`completed`,
  `abandoned`, `refunded`), client nominatif (`name`, `email`), catégories fixes de l'univers
  fictif, dates en UTC et jours découpés en UTC. Une vraie plateforme expose bien plus : statuts
  de paiement et d'expédition, remboursements partiels, taxes, livraison, remises, variantes de
  produits, commandes sans compte client.
- Une vingtaine de fonctions de `apps/web/src/lib/kpis` filtrent sur `status === 'completed'` :
  la définition de « commande qui compte » conditionne tous les indicateurs.
- `@salespulse/contracts` n'a aujourd'hui qu'un consommateur, `apps/web`, et mélange format
  réseau (`ShopListSchema`, `PageStatListSchema`…), agrégats internes du store mocké (`Dataset`,
  `AnalyticsDataset`) et modèle de la démo, sur lequel les KPIs du web sont typés.
- Le serveur, la base et les tables viennent aux jalons suivants (« Serveur API », « Base de
  données ») : trancher le modèle avant évite de migrer des données réelles plus tard.

## Décisions

- **D1 (2026-11-20) — Périmètre : le modèle, pas sa mise en œuvre** : ce jalon ne modifie ni
  `@salespulse/contracts`, ni les générateurs, ni l'application web. Les schémas actuels restent
  le format des routes de démonstration jusqu'au jalon « Indicateurs côté serveur ».
  `docs/domain-model.md` liste les écarts entre ces schémas et le modèle commun, que les jalons
  « Synchronisation » et « Indicateurs côté serveur » combleront. Raison : garder `main`
  déployable et une pull request relisible.
- **D2 (2026-11-20) — Document durable `docs/domain-model.md`** : le modèle vit dans un document
  de `docs/`, référencé par `CLAUDE.md`, et non dans ce jalon : il servira à tous les jalons du
  backend et évoluera avec eux. Le jalon garde les décisions et leur raison.
- **D3 (2026-11-20) — Cœur hexagonal dans `apps/api`** : le domaine vit dans `apps/api`,
  découpé par bounded context puis par couche :
  `apps/api/src/<contexte>/{domain,application,infrastructure}`, avec un shared kernel dans
  `apps/api/src/shared/domain/`. Le domaine (entities, value objects, règles) n'importe rien
  d'extérieur ; l'application (use cases) définit les ports (`OrderRepository`,
  `PlatformConnector`…) ; l'infrastructure porte les adapters (PostgreSQL, Express, connecteurs
  des plateformes, dont la démo). Les dépendances pointent vers l'intérieur, et un contexte
  n'importe un autre que par son `index.ts`. La règle est vérifiée par ESLint
  (`no-restricted-imports` par chemin, sans nouvelle dépendance) : une frontière de paquet ne la
  garantirait pas, les workspaces npm remontant les dépendances dans un `node_modules` commun.
  - Raisons : un contexte évolue dans un seul dossier ; P2 (« une plateforme se branche sans
    toucher au reste ») devient un adapter de plus du port `PlatformConnector` ; les use cases
    se testent en TDD avec des repositories en mémoire.
  - Alternatives écartées :
    - un paquet `packages/domain` : il coupait chaque contexte en deux (domaine d'un côté,
      application et adapters de l'autre), pour un second consommateur, la démo, qui n'a pas
      besoin du domaine puisque c'est son adapter qui traduit ses données ;
    - un paquet par contexte (`@salespulse/sales`, `@salespulse/shared`…) : un seul processus
      (D22), un outillage multiplié pour quelques fichiers, un shared kernel dont tous
      dépendraient, et des frontières encore mouvantes, plus coûteuses à déplacer entre paquets
      qu'entre dossiers.
  - Un paquet de domaine s'extraira si un vrai second consommateur apparaît, ou si les doublons
    entre domaine et contrat se multiplient ; les imports par `index.ts` le faciliteront.
- **D4 (2026-11-20) — Types de commit de la phase C** : `chore:` pour le paquet et son
  outillage, `feat:` pour chaque value object (nouveau comportement, test et code dans le même
  commit). Ce code n'est encore utilisé par rien et n'a aucun effet visible pour l'utilisateur :
  ces `feat:` ne justifient pas de release (`docs/gitflow.md`), ce que le Bilan rappellera.
- **D5 (2026-11-20) — `@salespulse/contracts`, format réseau seul** : le paquet est gardé, car
  il sera le seul code partagé entre `apps/api`, qui produit les réponses, et `apps/web`, qui
  les lit (une app n'importe pas depuis une autre). Les règles métier font foi dans le domaine,
  le format échangé dans le contrat ; le web s'adapte au contrat, jamais au domaine.
  - Nommage par usage : `RevenueKpi`, `RevenueSeries`, `TopProductItem`, `OrderListItem`…,
    jamais le nom d'une entity du domaine. Un `Order` du domaine et ce que reçoit le web sont
    deux modèles distincts, le contrat étant le published language entre les deux. Les schémas
    actuels (`Order`, `Customer`, `Product`) gardent leur nom tant qu'ils servent la démo (D1).
  - Calendrier : les agrégats internes du store mocké (`Dataset`, `AnalyticsDataset`) partent
    avec les générateurs au jalon « Synchronisation » ; les listes brutes de commandes, de
    clients et de produits sont remplacées par des agrégats au jalon « Indicateurs côté
    serveur ».
  - Tests : aucun tant qu'un schéma reste déclaratif (ce serait tester Zod) ; un `.test.ts`
    colocalisé dès qu'il porte un invariant entre champs (`.refine`), une transformation
    (`.transform`) ou un enjeu de rétrocompatibilité (réponses enregistrées au format
    précédent). La correspondance entre les énumérations du contrat et celles du domaine se
    teste dans `apps/api`.
  - Découpage du fichier par contexte (`shared.ts`, `shops.ts`, `sales.ts`, `analytics.ts`,
    `demo.ts`, réexportés par `index.ts`) : petit changement sans jalon, sur une branche
    `feature/split-contracts` juste après ce jalon, hors périmètre ici (D1).
  - Alternatives écartées : déplacer les schémas dans `apps/web` (l'API ne pourrait pas les
    importer), une spec OpenAPI générée avec un client généré (outillage et étape de build
    utiles surtout entre dépôts séparés), tRPC ou ts-rest (dépendance structurante qui figerait
    la façon d'appeler l'API).

## Phase A — Définitions métier ⬜

Brainstorm avec l'utilisateur : une décision par question, avec les pratiques des plateformes
(WooCommerce, Shopify, PrestaShop) vérifiées dans leur documentation.

- [ ] Statuts canoniques d'une commande : liste, distinction paiement / expédition, et règle
      « la commande compte dans les indicateurs ». Devenir des paniers abandonnés et des
      paiements échoués, qui ne sont pas toujours des commandes côté plateforme.
- [ ] Date de référence d'une commande : création, paiement ou finalisation.
- [ ] Chiffre d'affaires : HT ou TTC, livraison incluse ou non, remises déduites ; composantes
      conservées pour qu'une définition puisse changer sans resynchroniser.
- [ ] Remboursements, totaux et partiels : entity distincte ou non, date d'imputation (celle de
      la commande ou du remboursement), effet sur le chiffre d'affaires et sur le taux de
      remboursement.
- [ ] Fuseau horaire : un fuseau IANA par organisation (Europe/Paris par défaut), découpage des
      jours, semaines et mois dans ce fuseau, jours de 23 h et de 25 h aux changements d'heure,
      boutiques réglées sur un autre fuseau.
- [ ] Produits : niveau d'analyse (produit ou variante), catégories propres à chaque boutique,
      prix à la ligne de commande et produit supprimé côté plateforme.
- [ ] Clients : identité dans une boutique et d'une boutique à l'autre (identifiant externe,
      empreinte de l'e-mail et son secret), commandes sans compte, localisation conservée.
- [ ] Canal et appareil des commandes : source quand la plateforme les fournit, valeur
      « inconnu » sinon.

## Phase B — Document du modèle ⬜

- [ ] `docs/domain-model.md` : bounded contexts (organisations et accès, ventes, boutiques et
      synchronisation, analytics simulé, facturation à venir) et leurs relations.
- [ ] `docs/domain-model.md` : architecture hexagonale d'`apps/api` (D3) : couches, ports et
      adapters, règle d'imports.
- [ ] `docs/domain-model.md` : entities et aggregates (organisation, boutique, commande et ses
      lignes, remboursement, produit, client), leurs identifiants internes et externes, et
      l'unicité d'un identifiant externe dans une boutique.
- [ ] `docs/domain-model.md` : value objects (montant et devise, statut canonique, empreinte
      client, fuseau horaire, jour local, référence externe) et leurs invariants.
- [ ] `docs/domain-model.md` : écriture par le domaine (synchronisation) et lecture des
      indicateurs par agrégats SQL ; comment les règles du domaine s'appliquent à la lecture
      sans être dupliquées (champs calculés à l'écriture, par exemple « compte dans le CA »).
- [ ] `docs/domain-model.md` : correspondance des statuts de WooCommerce, de Shopify et de
      PrestaShop vers les statuts canoniques, vérifiée dans leur documentation.
- [ ] `docs/domain-model.md` : écarts avec les schémas actuels de `@salespulse/contracts` et
      jalon qui comble chacun (D1, D5).

## Phase C — Value objects en TypeScript ⬜

TDD : test rouge lancé et montré avant chaque code de production.

- [ ] `apps/api` : squelette du paquet `@salespulse/api`, sans Express ni serveur
      (`package.json`, `tsconfig.json` qui étend `tsconfig.base.json`, `vitest.config.mts`,
      script `typecheck`), couverture de `apps/api/src/**`.
- [ ] `package.json` racine : `npm test`, `test:watch` et `test:coverage` lancent chaque
      workspace qui a un script `test` (`--workspaces --if-present`), donc le CI aussi, sans
      retouche quand `contracts` aura ses premiers tests (D5).
- [ ] `eslint.config.mjs` : `no-restricted-imports` par chemin (D3) : `domain/` n'importe ni
      `application/`, ni `infrastructure/`, ni aucun paquet externe ; `application/`
      n'importe pas `infrastructure/` ; un contexte n'en importe un autre que par son
      `index.ts`. Chaque interdiction est prouvée par un import interdit temporaire qui fait
      échouer `npm run lint`, sortie montrée, puis retiré.
- [ ] `apps/api/src/shared/domain/money.ts` : montant entier en unités mineures avec son code
      ISO 4217 ; refus d'un montant non entier ; addition et soustraction refusées entre deux
      devises ; nombre de décimales propre à la devise.
- [ ] `apps/api/src/sales/domain/orderStatus.ts` : statuts canoniques et règle « compte dans
      les indicateurs », selon la phase A.
- [ ] `apps/api/src/shared/domain/localDay.ts` : jour local d'un instant dans un fuseau IANA,
      bornes d'un jour local en instants (jours de 23 h et de 25 h, passage d'année).

## Phase D — Documentation durable ⬜

- [ ] `CLAUDE.md` : structure du dépôt (`apps/api`), architecture hexagonale et règle d'imports
      (D3), rôle de `@salespulse/contracts`, nommage par usage et règle de test (D5), renvoi
      vers `docs/domain-model.md`, commandes de test (racine et fichier d'`apps/api`).
- [ ] `docs/vision.md` et `docs/stack.md` relus : un principe touché par la phase A (P9, P15) ou
      une dépendance nouvelle (fuseaux horaires) les met à jour ; entrée Zod de la stack
      alignée sur D5.
- [ ] `docs/roadmap.md` : « Serveur API » sans les conventions TDD d'`apps/api`, faites ici ;
      « Synchronisation » et « Indicateurs côté serveur » complétés par le calendrier de D5 ;
      piste « Découpage des contrats par contexte » ajoutée aux autres pistes, à faire juste
      après ce jalon ; sujets tranchés retirés.

## Journal

- 2026-11-20 : plan rédigé. Avant validation, D3 révisée : le paquet `packages/domain` d'abord
  proposé est abandonné au profit d'un cœur hexagonal dans `apps/api`, car il coupait chaque
  contexte en deux. D5 ajoutée après examen de `@salespulse/contracts` (un seul consommateur
  aujourd'hui, contenu mélangé) ; son découpage par contexte est reporté à une branche dédiée.
- 2026-11-20 : plan validé par l'utilisateur.

## Workflow Git

- `docs:` pour ce plan (fichier du jalon, index de la roadmap) ;
- `docs:` pour les définitions métier (phase A, décisions dans le jalon) ;
- `docs:` pour `docs/domain-model.md` (phase B) ;
- `chore:` pour le squelette d'`apps/api`, les scripts de test et la règle ESLint (phase C) ;
- `feat:` pour chaque value object, test et code dans le même commit (phase C, D4) ;
- `docs:` pour la documentation durable (phase D) ;
- `docs:` pour clore le jalon.

Chaque phase se termine par un point d'arrêt de relecture. Merge par pull request une fois
`checks` au vert. Aucun changement visible pour l'utilisateur : pas de release pour ce jalon.

## Critères d'acceptation

- `npm test`, `npm run lint`, `npm run typecheck` et `npm run build` sans erreur en local, tests
  d'`apps/api` compris.
- Chaque question de la phase A a sa décision datée dans ce jalon.
- `docs/domain-model.md` couvre chaque entity et chaque value object cités en phase B, et chaque
  statut des trois plateformes a son statut canonique.
- Un import interdit par D3 fait échouer `npm run lint` (sortie montrée pour chaque règle).
- `checks` au vert sur la pull request de la branche, tests d'`apps/api` compris.

## Bilan

<Rempli à la clôture.>
