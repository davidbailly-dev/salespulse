# Modèle du domaine

Modèle commun du backend (`apps/api`) : bounded contexts, entities, value objects et invariants.
Il sert à tous les jalons du backend et évolue avec eux. Les décisions et leurs raisons vivent
dans les jalons, cités entre parenthèses : « jalon 007, D10 », ou « D12 » seul pour le jalon
010 ([Modèle de données](milestones/010-data-model.md)), qui a établi ce modèle. Les principes
cités (P2, P11, P15…) sont ceux de `docs/vision.md`.

---

## Bounded contexts

Chaque contexte a son dossier `apps/api/src/<contexte>/` et n'est importé par un autre que par
son `index.ts` (D3) :

- Organisations et accès : `organizations` ;
- Boutiques et synchronisation : `shops` ;
- Ventes : `sales` ;
- Analytics simulé : `analytics` ;
- Facturation, à venir : `billing`.

Le **shared kernel** (`apps/api/src/shared/domain/`) regroupe ce que plusieurs contextes
partagent sans le posséder : `Money`, le fuseau IANA, `LocalDay`, `OrganisationId` et `ShopId`.

### Organisations et accès

- **Contient** : organisation, membres et rôles (jalon 007, D3), connexion, fuseau horaire de
  l'organisation (D12).
- **Ne contient pas** : aucune donnée de vente.

Amont de tous les autres contextes : chaque donnée appartient à une organisation (P11), et les
use cases vérifient le rôle du membre qui les appelle. Le fuseau horaire de l'organisation
découpe les jours, les semaines et les mois de tous les indicateurs (D12).

### Boutiques et synchronisation

- **Contient** : boutique, plateforme, identifiants d'accès chiffrés (P16), exécutions et
  curseurs de synchronisation, port `PlatformConnector` et ses adapters, démo comprise.
- **Ne contient pas** : aucune règle sur les commandes.

Il connaît les plateformes ; aucun autre contexte ne les connaît (P2). Ses adapters forment
l'anticorruption layer : ils traduisent les données de chaque plateforme dans le modèle
canonique de Ventes, puis appellent les use cases d'écriture de Ventes. L'adapter de la démo
alimente aussi Analytics simulé.

L'adapter calcule l'empreinte de l'e-mail du client avant d'appeler Ventes : l'e-mail en clair
ne sort jamais de ce contexte (D18, P15).

### Ventes

- **Contient** : commande et ses lignes, remboursement, produit et ses catégories, client ;
  statuts canoniques, chiffre d'affaires et jour local (D6 à D14).
- **Ne contient pas** : canal et appareil des commandes (D15), e-mail en clair (D18).

Le cœur du produit : un seul bounded context, quatre aggregates (commande, remboursement,
produit, client) qui se référencent par identifiant (D16). Il définit le modèle canonique
auquel les adapters des plateformes se conforment, et ne connaît d'une boutique que son
`ShopId`. Il lit le fuseau de l'organisation pour calculer le jour local des commandes et des
remboursements à l'écriture.

Un sous-ensemble en sortira s'il prend des règles étrangères aux ventes : stocks, coûts et
marges pour un catalogue, segmentation ou consentements pour les clients.

### Analytics simulé

- **Contient** : trafic, pages vues, recherches, dépenses publicitaires, Web Vitals, erreurs,
  e-mails ; indicateurs croisés avec les ventes (D17).
- **Ne contient pas** : commandes et clients.

Données de visite et de publicité, fournies aujourd'hui par la seule démo. Les indicateurs qui
les combinent avec les ventes (taux de conversion, CAC, ROAS) vivent ici et lisent Ventes ;
Ventes ne connaît pas l'analytics (D17). La piste « Analytics réel » remplacera la démo par de
vrais connecteurs et reprendra le canal et l'appareil des commandes (D15).

### Facturation

- **Contient** : essai, abonnement, impayé (jalon 007, D2 et D10).
- **Ne contient pas** : son contenu détaillé sera tranché à son jalon.

Elle dépend d'Organisations et ne dépend pas de la synchronisation : à la fin de l'essai ou en
cas d'impayé, elle marque l'organisation comme suspendue, ce que la synchronisation consulte
avant chaque exécution. Le tableau de bord reste consultable, seule la synchronisation s'arrête
(jalon 007, D10). La dépendance ne boucle pas, même si le tarif se calcule par boutique.

### Relations

```
Facturation ───── suspension ─────────► Organisations et accès ◄──── tous les contextes

Plateformes ──ACL──► Boutiques et synchronisation ──écrit──► Ventes
                                  │                            ▲
                                  │                            │ lit
                                  └───── démo : écrit ────► Analytics simulé
```

- Une flèche va du contexte qui dépend vers celui dont il dépend ; « écrit » va de l'appelant
  vers le contexte qui possède la donnée.
- Aucun cycle : Ventes ne dépend que d'Organisations ; Analytics d'Organisations et de Ventes ;
  Boutiques et synchronisation d'Organisations, de Ventes et d'Analytics.
- Le web n'est pas un contexte : il ne connaît que `@salespulse/contracts`, le published
  language entre l'API et l'interface (D5).

---

## Architecture hexagonale

Chaque contexte est découpé en trois couches (D3) :
`apps/api/src/<contexte>/{domain,application,infrastructure}`, plus son `index.ts`. Les
dépendances pointent vers l'intérieur : l'infrastructure dépend de l'application, qui dépend du
domaine.

### Couches

- **`domain/`** : entities, value objects, règles et erreurs du domaine. Code pur et
  déterministe : aucune entrée/sortie, aucune horloge (`now` est passé en paramètre). Un fichier
  par entity ou value object, nommé en camelCase (`orderStatus.ts`), sans sous-dossier pour
  l'instant (D22).
- **`application/`** : use cases et ports qu'ils utilisent (`OrderRepository`,
  `PlatformConnector`, horloge s'il en faut une). Un use case orchestre le domaine et les ports ;
  il ne contient pas de règle métier.
- **`infrastructure/`** : adapters des ports, dans les deux sens :
  - entrants : routes Express du contexte, déclenchement planifié de la synchronisation ;
  - sortants : repositories PostgreSQL, connecteurs des plateformes (démo comprise), calcul
    HMAC de l'empreinte client (D18), horloge réelle ;
  - en mémoire : `InMemoryOrderRepository`… pour les tests des use cases (D21).

Le **shared kernel** (`shared/domain/`) suit les règles d'un `domain/` et n'importe aucun
contexte.

### `index.ts` d'un contexte

Il exporte les use cases et les types et value objects de leurs entrées et sorties, jamais un
repository ni un adapter (D20). Un contexte qui en appelle un autre (la synchronisation qui
enregistre des commandes dans Ventes) reçoit son use case par injection, comme un port, et ne
l'importe que pour son type.

### Composition root

Un seul module, à la racine d'`apps/api/src/`, importe l'infrastructure de plusieurs contextes
(D19). Il instancie les adapters, les injecte dans les use cases et monte les routes de chaque
contexte, sans conteneur d'injection ni framework. Son nom et le point d'entrée du serveur sont
tranchés au jalon « Serveur API ».

### Règle d'imports

Vérifiée par ESLint (`no-restricted-imports` par chemin, D3) :

- `<contexte>/domain/` : son `domain/` et `shared/domain/` ;
- `shared/domain/` : lui-même ;
- `<contexte>/application/` : son `domain/`, son `application/`, `shared/domain/` et
  l'`index.ts` d'un autre contexte ;
- `<contexte>/infrastructure/` : tout son contexte, `shared/domain/`, l'`index.ts` d'un autre
  contexte, les paquets externes et `@salespulse/contracts` ;
- composition root : tout ;
- `*.test.ts` : exemptés, `vitest` et adapters en mémoire compris (D21).

Aucun paquet externe dans `domain/` ni dans `application/`. Un contexte n'en importe jamais un
autre ailleurs que par son `index.ts`.

### Portée

L'architecture hexagonale sert l'écriture : synchronisation, règles métier, invariants. La
lecture des indicateurs passe par des requêtes d'agrégat, une par indicateur, sans charger
d'entity (voir « Écriture et lecture »).

---

## Entities et aggregates

### Identifiants

- **Identifiant interne** : un UUID par racine d'aggregate, généré par l'application à travers
  un port (D23). Les entities internes (lignes, variantes) n'en ont pas.
- **Référence externe** : l'identifiant de la donnée sur sa plateforme, en chaîne de caractères,
  unique dans une boutique pour chaque type d'aggregate (D24). La synchronisation fait un upsert
  idempotent sur (boutique, référence externe).
- **Références entre aggregates de Ventes** : par référence externe dans la boutique, et par
  empreinte pour le client (D25). L'UUID sert à l'identité, à l'API et aux journaux.
- **Organisation** : chaque aggregate porte l'identifiant de son organisation, même quand il se
  déduit de sa boutique (D28, P11).

### Organisations et accès

- **Organisation** (racine) : nom, fuseau IANA (D12), état suspendu (Facturation, à venir).
  Membres et rôles (jalon 007, D3) : détaillés au jalon « Authentification et organisations ».

### Boutiques et synchronisation

- **Boutique** (racine) : plateforme (`woocommerce`, `shopify`, `prestashop`, `demo`), nom,
  devise (euro seul, jalon 007, D11), fuseau de la boutique (D12), identifiants d'accès chiffrés
  (P16), état de synchronisation. Unique sur (organisation, plateforme, identifiant de la
  boutique sur sa plateforme) : deux organisations peuvent connecter la même boutique (D30).
- Les exécutions de synchronisation et leur historique : aggregate défini au jalon
  « Synchronisation ».

### Ventes

Quatre aggregates du même contexte (D16), plus la catégorie (D29). Chacun est unique sur
(boutique, référence externe), sauf le client.

- **Commande** (racine) : statut canonique et statut brut de la plateforme (D6), date de
  création et date de paiement (D9), composantes des montants en unités mineures avec leur
  devise (D10), numéro affiché (D24), empreinte du client, nulle sans e-mail (D14).
  - **Ligne de commande** (entity interne) : photo prise à la commande (D13) : référence
    externe de la ligne, du produit et de la variante, nom, libellé de la variante, SKU,
    quantité, prix unitaire HT après remises et composantes des montants.
- **Remboursement** (racine, D26) : référence externe de sa commande, date, montants HT par
  composante (produits, livraison) et taxes à part (D11). Il ne modifie jamais sa commande.
  - **Ligne de remboursement** (entity interne), quand la plateforme la fournit : référence
    externe du produit, quantité, montant HT.
- **Produit** (racine) : nom, SKU, état supprimé, références externes de ses catégories et de sa
  catégorie principale (D13).
  - **Variante** (entity interne) : référence externe, libellé, SKU.
- **Catégorie** (racine, D29) : libellé. Propre à sa boutique, sans référentiel commun (D13).
- **Client** (racine, D27) : unique sur (boutique, empreinte) ; identifiant externe (sans
  unicité), date d'arrivée, pays (D14). Son identité dans l'organisation est l'empreinte : la
  vue « toutes boutiques » regroupe par empreinte.

### Analytics simulé

Lignes journalières de la démo (trafic, pages vues, recherches, dépenses publicitaires, Web
Vitals, erreurs, e-mails) : leur modèle se définira avec la piste « Analytics réel » (D15).

---

## Value objects et invariants

### Forme

- Types en lecture seule, marqués (branded), produits par une fonction de fabrique qui vérifie
  l'invariant : `money()` produit un `Money`, et aucun autre code ne peut en fabriquer un
  (D31). Pas de classes ; deux valeurs se comparent par leurs champs.
- Une valeur invalide lève une `DomainError`, une seule classe avec un code (`invalid-money`,
  `currency-mismatch`…). L'adapter de synchronisation l'attrape et l'inscrit dans le journal de
  la synchronisation sans l'arrêter (D32).

### Shared kernel

- **`Money`** : montant entier en unités mineures (`Number.isSafeInteger`), négatif admis, avec
  sa `CurrencyCode`. Addition et soustraction dans la même devise seulement, sinon
  `currency-mismatch` ; ni multiplication ni division (D33). Le nombre de décimales dépend de la
  devise (EUR 2, JPY 0).
- **`CurrencyCode`** : code ISO 4217 reconnu par `Intl`. Toute devise est acceptée ici ; la
  restriction à l'euro est une règle de la boutique (jalon 007, D11 et D17).
- **`IanaTimezone`** : fuseau accepté par `Intl.DateTimeFormat` (`Europe/Paris`, `UTC`…).
- **`LocalDay`** : date `AAAA-MM-JJ` valide (29 février compris), comparable dans l'ordre
  alphabétique (D34). Il donne :
  - le jour local d'un instant dans un fuseau ;
  - ses bornes en instants UTC, intervalle semi-ouvert [début, début du lendemain[, de 23 h ou
    de 25 h aux changements d'heure (D12).
- **`ExternalRef`** : chaîne non vide, conservée telle quelle, sans normalisation (D24).
- **Identifiants** (`OrganisationId`, `ShopId`, `OrderId`…) : UUID valide, un type distinct par
  aggregate, déclaré dans le contexte qui le possède ou dans le shared kernel s'il est partagé.
  Un `ShopId` ne peut pas être passé là où un `OrderId` est attendu.

Les instants sont des `Date` en UTC, jamais modifiées après création (D34).

### Ventes

- **`OrderStatus`** : `pending`, `paid`, `failed` ou `cancelled` (D6). Une commande compte dans
  les indicateurs si et seulement si elle est `paid` (D7).
- **`CustomerFingerprint`** : 64 caractères hexadécimaux en minuscules (HMAC-SHA256, D14). Le
  value object ne vérifie que le format ; la normalisation de l'e-mail et le calcul du HMAC
  sont faits par l'adapter de la plateforme (D18, D35).
- **`CountryCode`** : deux lettres majuscules (ISO 3166-1 alpha-2, D14).

### Invariants des entities de Ventes

Vérifiés par la fabrique de chaque aggregate (D36) :

- une commande est `paid` si et seulement si elle a une date de paiement (D36, D43) ;
- tous les montants d'une commande et de ses lignes sont dans la même devise, de même pour un
  remboursement et ses lignes ;
- la quantité d'une ligne de commande est un entier strictement positif ;
- les montants d'un remboursement sont positifs ou nuls : ils sont soustraits à la lecture
  (D11).

---

## Écriture et lecture

Un CQRS léger : une seule base, les mêmes tables, deux chemins (D37).

### Écriture

La synchronisation appelle les use cases d'écriture de Ventes. Ils construisent les aggregates
par leurs fabriques, qui vérifient les invariants, puis les enregistrent par upsert sur
(boutique, référence externe) (D24).

À l'écriture, le domaine calcule et stocke les **champs dérivés** dont la lecture a besoin
(D38) :

- commande : `countsInIndicators` (D7), jour local du paiement (D12), ventes nettes HT, soit
  ventes brutes HT moins remises HT (D10) ;
- ligne de commande : ventes nettes HT de la ligne ;
- remboursement : jour local du remboursement, montant HT des produits remboursés (D11) ;
- client : jour local d'arrivée (D14).

Quand une règle, une correspondance de statut ou le fuseau de l'organisation change, un use
case recalcule ces champs à partir des données stockées (statut brut, composantes, instants),
sans resynchroniser (D39).

### Lecture

- Un indicateur est une requête d'agrégat SQL (`SUM`, `COUNT`, `GROUP BY` sur le jour local),
  sans charger d'entity. Les ports de requête (`SalesQueries`…) sont définis dans
  `application/` et implémentés en SQL dans `infrastructure/` ; ils renvoient des read models
  simples (nombres, séries), que l'adapter HTTP convertit au format du contrat (D5).
- Le SQL filtre, additionne et regroupe les champs dérivés ; il ne réimplémente aucune règle :
  jamais `status = 'paid'` ni `gross - discounts`, mais `counts_in_indicators` et `net_sales`
  (D38).
- La période est une plage de `LocalDay` dans le fuseau de l'organisation, pas une plage
  d'instants (D40).
- Les requêtes d'un contexte ne lisent que ses tables. Un indicateur croisé (taux de conversion,
  CAC) se compose dans l'application d'Analytics, à partir d'une requête de Ventes appelée par
  son `index.ts` et d'une requête d'Analytics (D41).
- Les requêtes portent directement sur les tables, avec des index sur (organisation, jour
  local) ; des agrégats journaliers pré-calculés ne s'ajouteront que si les temps mesurés le
  demandent (D42).

### Tests

- Écriture : use cases testés en TDD avec les adapters en mémoire (D21).
- Lecture : adapters SQL testés contre une vraie PostgreSQL, base jetable (D42) ; pas de
  version en mémoire, qui recopierait le SQL en TypeScript.

---

## Correspondance des statuts

### Règle commune : le paiement est acquis

Le statut canonique se déduit de la date de paiement (D43) :

- date de paiement connue : `paid`, même si la commande est ensuite annulée ou marquée
  remboursée sur la plateforme ; l'argent rendu passe par les remboursements, imputés à leur
  date (D11) ;
- sans date de paiement : le statut brut donne `pending`, `failed` ou `cancelled` ;
- une date de paiement connue n'est jamais effacée par une synchronisation suivante ;
- le statut brut est toujours conservé (D6) ; un statut inconnu donne `pending` et est signalé
  dans le journal de la synchronisation.

Un remboursement, partiel ou total, ne change pas le statut canonique (D6, D26).

Conséquence pour le commerçant : une commande annulée après paiement, remboursée hors de la
plateforme sans remboursement enregistré, reste dans le chiffre d'affaires. Le statut brut
permet d'afficher « Annulée après paiement », et un indicateur des commandes annulées après
paiement sans remboursement lui signalera ce qu'il doit régulariser.

### WooCommerce (D44)

Date de paiement : `date_paid_gmt` (« The date the order was paid, as GMT »).

| Statut brut               | Sans date de paiement | Documentation                          |
| ------------------------- | --------------------- | -------------------------------------- |
| `pending`                 | `pending`             | « no payment has been made »           |
| `on-hold`                 | `pending`             | « awaiting payment confirmation »      |
| `processing`, `completed` | (payée)               | statuts de `wc_get_is_paid_statuses()` |
| `refunded`                | (payée)               | « fully refunded … after payment »     |
| `failed`                  | `failed`              | « payment failed or was declined »     |
| `cancelled`               | `cancelled`           | « canceled by an admin or the customer » |
| statut personnalisé       | `pending`, signalé    | non documenté                          |
| brouillon de checkout     | non synchronisé       | « before an order is submitted »       |

Sources : [Order statuses](https://woocommerce.com/document/managing-orders/order-statuses/),
[REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/#order-properties),
`wc-order-functions.php` du dépôt `woocommerce/woocommerce`.

### Shopify (D45)

Date de paiement : `processedAt` de la transaction `SALE` ou `CAPTURE` en `SUCCESS` qui solde
la commande.

| `displayFinancialStatus`                   | Canonique                                    |
| ------------------------------------------ | -------------------------------------------- |
| `PAID`, `PARTIALLY_REFUNDED`, `REFUNDED`   | `paid`, annulée ou non                       |
| `PENDING`, `AUTHORIZED`, `PARTIALLY_PAID`  | `pending`, ou `cancelled` si `cancelledAt`   |
| `EXPIRED`                                  | `failed`                                     |
| `VOIDED`                                   | `cancelled`                                  |

`AUTHORIZED` reste `pending` jusqu'à l'encaissement (D7). `PARTIALLY_PAID` reste `pending` par
prudence : une capture partielle définitive ne compterait jamais. Les commandes de test ne sont
pas synchronisées (D8).

Sources : [OrderDisplayFinancialStatus][shopify-financial-status],
[OrderTransaction](https://shopify.dev/docs/api/admin-graphql/latest/objects/OrderTransaction),
[Refund](https://shopify.dev/docs/api/admin-graphql/latest/objects/Refund),
[Canceling orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/canceling-orders).

[shopify-financial-status]:
    https://shopify.dev/docs/api/admin-graphql/latest/enums/OrderDisplayFinancialStatus

### PrestaShop (D46)

Par l'indicateur `paid` de l'état (« Set the order as paid »), pas par `logable` (« Consider
the associated order as validated », qui alimente `valid` et les statistiques de PrestaShop).
Date de paiement : premier état `paid` de `order_histories`, à défaut `invoice_date` (D9).

| Id | État par défaut                     | `paid` | `logable` | Canonique             |
| -- | ----------------------------------- | ------ | --------- | --------------------- |
| 1  | Awaiting check payment              | 0      | 0         | `pending`             |
| 2  | Payment accepted                    | 1      | 1         | `paid`                |
| 3  | Processing in progress              | 1      | 1         | `paid`                |
| 4  | Shipped                             | 1      | 1         | `paid`                |
| 5  | Delivered                           | 1      | 1         | `paid`                |
| 6  | Canceled (`PS_OS_CANCELED`)         | 0      | 0         | `cancelled`           |
| 7  | Refunded (`PS_OS_REFUND`)           | 0      | 0         | `paid` (historique)   |
| 8  | Payment error (`PS_OS_ERROR`)       | 0      | 0         | `failed`              |
| 9  | On backorder (paid)                 | 1      | 0         | `paid`                |
| 10 | Awaiting bank wire payment          | 0      | 0         | `pending`             |
| 11 | Remote payment accepted             | 1      | 1         | `paid`                |
| 12 | On backorder (not paid)             | 0      | 0         | `pending`             |
| 13 | Awaiting Cash On Delivery validation | 0      | 0         | `pending`             |

Un état créé par le commerçant suit la même règle : `paid` à 1 donne `paid` ; sans date de
paiement, l'état configuré dans `PS_OS_ERROR` donne `failed`, celui de `PS_OS_CANCELED`
`cancelled`, tout autre `pending`.

Sources : `install-dev/data/xml/order_state.xml`, `install-dev/langs/en/data/order_state.xml`
et `install-dev/data/xml/configuration.xml` du dépôt `PrestaShop/PrestaShop` (branche `8.2.x`),
`AdminStatusesController.php` pour les libellés des indicateurs ;
[order_states](https://devdocs.prestashop-project.org/8/webservice/resources/order_states/),
[order_histories](https://devdocs.prestashop-project.org/8/webservice/resources/order_histories/).

### Points à vérifier aux jalons des connecteurs

- WooCommerce :
  - valeur exacte du statut brouillon (`checkout-draft`) et sort des commandes à la corbeille ;
  - effacement ou non de `date_paid` à l'annulation : s'il est effacé, une commande annulée
    après paiement importée avec l'historique serait vue comme jamais payée (D43) ;
  - exposition des statuts personnalisés par l'API REST.
- Shopify :
  - sens précis de `processedAt` d'une transaction, et cas où il est nul ;
  - transaction créée par « marquer comme payée » ;
  - annulation par l'API (`orderCancel`) et statut financier qui en résulte ;
  - statut des transactions d'un `Refund`, qui « doesn't guarantee that the money has been
    returned » (D11) ;
  - capture partielle définitive (`PARTIALLY_PAID`).
- PrestaShop :
  - état « Refunded » posé sans avoir (`order_slip`) : le chiffre d'affaires reste compté ;
  - montants HT des avoirs exposés par le webservice ;
  - fuseau des dates (D12).

---

## Écarts avec la démo actuelle

Les schémas de `@salespulse/contracts` et l'interface suivent encore le modèle de la démo. Ils
restent le format des routes de démonstration jusqu'au jalon « Indicateurs côté serveur »
(D1). Chaque écart indique le jalon qui le comble, selon le calendrier de D5 :

- **S** : « Synchronisation et plateforme de démonstration » ; les générateurs deviennent le
  connecteur de démonstration et produisent le modèle canonique ;
- **I** : « Indicateurs côté serveur et gestion des boutiques » ; les indicateurs passent côté
  serveur, avec des contrats nommés par usage.

### Schémas du contrat

- `OrderStatus` (`completed`, `abandoned`, `refunded`) → `pending`, `paid`, `failed`,
  `cancelled`, plus le statut brut (D6, D43). **S**
- `Order.date` unique → date de création et date de paiement (D9). **S**
- `totalAmount`, `unitPrice` en euros décimaux, sans composantes → `Money` en unités mineures,
  composantes HT et taxes (D10, D33). **S**
- Aucun remboursement, seulement le statut `refunded` → aggregate Remboursement, partiel ou
  total (D11, D26). **S**
- `OrderLine` (`productId`, `quantity`, `unitPrice`) → photo de la ligne : nom, SKU, variante,
  références externes (D13). **S**
- `Order.customerId` obligatoire → empreinte, nulle sans e-mail (D14, D27). **S**
- `CategorySchema` (cinq catégories fixes, une par produit) → catégories propres à chaque
  boutique, catégorie principale (D13, D29). **S**
- `Product.price` courant, sans variantes ni état supprimé → variantes, état supprimé (D13).
  **S**
- `Customer.name`, `email`, `registeredAt` tiré au hasard → empreinte, identifiant externe,
  date d'arrivée, pays (D14). **S**
- `Shop` (`id`, `name`) → plateforme, devise, fuseau (D30). **S**
- Identifiants UUID ou slugs, sans référence externe → UUID et référence externe (D23, D24).
  **S**
- `Dataset`, `AnalyticsDataset` dans le contrat → retirés avec les générateurs (D5). **S**
- Listes brutes de commandes, de clients et de produits → agrégats nommés par usage (D5 ;
  jalon 007, D8). **I**

### Interface et indicateurs

- Période en instants `from` / `to`, jours découpés en UTC (`dateRangePresets.ts`,
  `subtractOneYear.ts`) → plage de `LocalDay` dans le fuseau de l'organisation (D12, D40). **I**
- Une vingtaine d'indicateurs filtrent sur `status === 'completed'` ; une commande remboursée
  sort entièrement du chiffre d'affaires → commandes `paid`, moins les remboursements à leur
  date (D7, D11, D43). **I**
- `refundRate.ts` en nombre de commandes, `refundedRevenue.ts` en TTC → montant HT des produits
  remboursés, à la date du remboursement (D11). **I**
- `revenueByStatus.ts` répartit entre `completed`, `abandoned` et `refunded` → à redéfinir sur
  les statuts canoniques. **I**
- `conversionRate.ts` (commandes `completed` ÷ toutes les commandes) → commandes ÷ sessions,
  composé dans Analytics (D17). **I**
- `topProducts.ts` (quantité × `unitPrice`) → ventes nettes HT de la ligne, moins les lignes
  remboursées (D13, D38). **I**
- `topCategories.ts`, `neverSoldProducts.ts` sur les catégories fixes → catégorie principale,
  regroupement par libellé en vue « toutes boutiques » (D13). **I**
- Noms de clients affichés (`TopCustomers.tsx`, `TopCustomersByOrderCount.tsx`,
  `NeverConvertedCustomers.tsx`) → « Client n° 1042 » ou « Client invité » et un extrait de
  l'empreinte (D14, P15). **I**
- `averageCustomerTenure.ts` sur `registeredAt`, nouveaux clients par première commande
  (`customerAcquisitionCost.ts`) → date d'arrivée (D14). **I**
- Un client de deux boutiques compté deux fois en vue « toutes boutiques » → regroupement par
  empreinte (D27). **I**
- Montants arrondis à l'euro depuis des décimaux → formatage selon la devise, depuis les unités
  mineures (D33). **I**

### Propres à la démo

Sans équivalent dans le modèle, ils restent propres à la démo :

- statut `abandoned` et `abandonedCarts.ts` : piste « Paniers abandonnés réels » (D8) ;
- `paymentFailureRate.ts`, calculé sur les erreurs de l'analytics simulé (D8) ;
- `Order.channel`, `Order.device` et les indicateurs qui s'en servent (`deviceBreakdown.ts`,
  conversion par appareil, part du ROAS attribuée par canal) : piste « Analytics réel » (D15) ;
- lignes analytics datées au début du jour UTC : sujet ouvert du jalon I (devenir des routes de
  l'analytics simulé), puis piste « Analytics réel ».

### À trancher plus tard

- Format du paramètre `?shop=` : les boutiques de la démo ont des slugs fixes, une vraie
  boutique un UUID (D23) ; UUID ou slug dérivé du nom, à trancher au jalon I avec la page de
  gestion des boutiques.
- Le placeholder aléatoire de `decliningProducts.ts` n'est pas un écart de modèle : il relève de
  la piste « Produits en déclin réels », intégrée au jalon I.
