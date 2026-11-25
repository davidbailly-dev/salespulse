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
- **D6 (2026-11-23) — Statut canonique d'une commande** : un seul axe, orienté paiement, à quatre
  valeurs : `pending` (en attente de paiement), `paid` (payée), `failed` (paiement en échec ou
  expiré) et `cancelled` (annulée). Le remboursement n'est pas un statut : il se déduit des
  remboursements de la commande, partiels ou totaux. L'expédition n'est pas modélisée. Le statut
  brut de la plateforme est conservé à côté du statut canonique, pour qu'une correspondance
  corrigée se réapplique sans resynchroniser.
  - Raisons : les trois plateformes structurent leurs statuts différemment (un `status` unique
    chez WooCommerce, deux axes paiement et expédition chez Shopify, des états définis par le
    commerçant avec des indicateurs `paid`, `shipped` et `logable` chez PrestaShop), mais toutes
    disent si la commande est payée. Aucun indicateur ne dépend de l'expédition, dont le suivi
    relève de la gestion opérationnelle, non-objectif de `docs/vision.md`.
  - Alternatives écartées : un statut unique mêlant paiement, expédition et remboursement, à la
    WooCommerce (un `refunded` unique ne représente pas un remboursement partiel) ; deux axes
    paiement et expédition, à la Shopify (axe sans indicateur, et mal déduit chez WooCommerce,
    où `completed` peut signifier « rien à expédier »).
- **D7 (2026-11-23) — Commande qui compte dans les indicateurs** : seules les commandes `paid`
  comptent. Une commande `pending` compte une fois payée ; un paiement autorisé mais pas encore
  encaissé (`AUTHORIZED` chez Shopify) reste `pending`. Les commandes `pending`, `failed` et
  `cancelled` sont conservées et restent lisibles par de futurs indicateurs.
  - Raisons : le chiffre d'affaires est de l'argent encaissé, sans exception à expliquer. Un
    chiffre déjà consulté ne baisse pas après coup quand une commande en attente est annulée
    (P6). Chez WooCommerce, `pending` désigne souvent un client parti de la page de paiement,
    annulé à l'expiration de la réservation du stock ; une autorisation Shopify peut expirer
    (`EXPIRED`).
  - Conséquence acceptée : chez un commerçant qui encaisse à l'expédition, le chiffre d'affaires
    des derniers jours apparaît avec retard.
  - Alternatives écartées : compter aussi les commandes `pending` (logique « commandes passées »
    des rapports des plateformes, mais un chiffre gonflé puis corrigé à l'annulation) ; compter
    certains `pending` jugés sûrs (`AUTHORIZED`, `on-hold`), ce qui ferait dépendre la règle du
    statut brut de chaque plateforme, contre D6.
- **D8 (2026-11-23) — Paniers abandonnés, paiements échoués et commandes de test** :
  - le panier abandonné sort du modèle de commande : il n'est une commande sur aucune des trois
    plateformes (ressource `AbandonedCheckout` séparée chez Shopify, paniers sans commande chez
    PrestaShop, rien dans le cœur de WooCommerce). S'il revient, ce sera une entity distincte,
    fournie par les seuls connecteurs qui en disposent : piste « Paniers abandonnés réels »,
    ajoutée en phase D. D'ici là, l'indicateur « Paniers abandonnés » et le statut `abandoned`
    restent propres à la démo, écart noté dans `docs/domain-model.md` ;
  - une commande dont le paiement a échoué est conservée en `failed` quand la plateforme l'a
    créée, sans jamais compter (D7). Le taux d'échec de paiement ne se calcule pas à partir des
    commandes `failed` : WooCommerce en crée, Shopify en général non, le taux ne serait pas
    comparable d'une plateforme à l'autre. L'indicateur actuel « Taux d'échec de paiement »
    (`paymentFailureRate.ts`) compte les échecs dans les erreurs de l'analytics simulé : il
    reste simulé, comme les autres indicateurs qui croisent analytics et commandes ;
  - les commandes de test de Shopify (`test: true`) ne sont pas synchronisées : elles ne sont
    pas réelles et ne peuvent pas être converties en vraies commandes. WooCommerce et
    PrestaShop n'ont pas d'équivalent.
  - Alternative écartée : assimiler les commandes `pending` ou `failed` jamais payées à des
    paniers abandonnés, indicateur faux et non comparable d'une plateforme à l'autre.
- **D9 (2026-11-23) — Date de référence d'une commande** : la date de paiement place une
  commande dans une période (jour, mois, N-1). La date de création est conservée à côté, pour
  de futurs indicateurs (délai de paiement, répartition horaire des achats).
  - Raisons : cohérente avec D7, une commande compte quand elle est payée et dans la période où
    elle l'a été ; une période terminée ne change plus quand un paiement arrive plus tard.
    C'est le réglage par défaut de WooCommerce Analytics (« Date Type » : « Date Paid »), qui
    exclut alors les commandes sans date de paiement.
  - Coût accepté, porté par les connecteurs (P2) : Shopify n'a pas de date de paiement sur la
    commande, elle se déduit des transactions encaissées ; PrestaShop la donne par la date du
    premier état `paid` de l'historique (`order_histories`), à défaut par `invoice_date` ;
    WooCommerce la fournit directement (`date_paid_gmt`, « The date the order was paid, as
    GMT »). À vérifier en phase B : la date des transactions Shopify.
  - Alternatives écartées : la date de création (une commande payée après coup ajouterait du
    chiffre d'affaires à une période déjà consultée) ; la date de finalisation (`date_completed`,
    `closedAt`), qui dépend de l'expédition, non modélisée (D6).
- **D10 (2026-11-23) — Chiffre d'affaires** : le chiffre d'affaires est le montant des ventes
  nettes hors taxes et hors livraison : prix × quantité, moins les remises, hors taxes. Le
  panier moyen et le chiffre d'affaires par client suivent la même définition. Les composantes
  sont conservées à la commande et à la ligne, en unités mineures avec leur devise (jalon 007,
  D17) : ventes brutes HT, remises HT, livraison HT, taxes des produits, taxe de la livraison et
  total payé TTC. Une définition peut ainsi changer, ou un indicateur « ventes totales »
  s'ajouter, sans resynchroniser. La déduction des remboursements relève de la décision sur les
  remboursements.
  - Raisons : c'est la définition des « Net sales » de WooCommerce Analytics (« Gross Sales –
    Returns – Coupons ») et des rapports de Shopify (« gross sales - discounts - sales
    reversals »), hors taxes et livraison chez les deux, et l'usage comptable français. La TVA
    n'est pas l'argent du commerçant et la livraison est surtout un coût refacturé ; un montant
    HT garde les boutiques comparables, qu'elles affichent leurs prix TTC ou HT, et d'une année
    à l'autre si un taux change.
  - Faisabilité : le HT se lit sur les trois plateformes : `total` et `total_tax` des lignes,
    `shipping_total`, `shipping_tax` et `discount_total` chez WooCommerce ;
    `priceAfterAllDiscountsBeforeTaxesSet` des lignes chez Shopify, dont les prix incluent la
    taxe quand `taxesIncluded` est vrai ; `total_products`, `total_discounts_tax_excl` et
    `total_shipping_tax_excl` chez PrestaShop.
  - Alternative écartée : les ventes totales TTC, livraison comprise, soit ce que le client a
    payé, mais gonflées par la TVA et sensibles aux taux, donc non comparables entre boutiques
    ni d'une année à l'autre.
- **D11 (2026-11-23) — Remboursements** :
  - le remboursement est une entity distincte, rattachée à sa commande (place dans les
    aggregates fixée en phase B) : sa date, ses montants HT par composante (produits,
    livraison) avec leurs taxes à part comme pour la vente (D10), et ses lignes (produit,
    quantité, montant HT) quand la plateforme les fournit. Un remboursement total ou partiel a
    la même forme ;
  - il est imputé à sa propre date, pas à celle de la commande : une période terminée ne change
    plus (D9), même pour un remboursement tardif ;
  - le chiffre d'affaires d'une période est le montant des ventes nettes HT des commandes payées
    dans la période, moins les remboursements HT des produits émis dans la période. La livraison
    et les taxes remboursées restent hors chiffre d'affaires, comme à la vente ;
  - le taux de remboursement se calcule en montant : montant HT des produits remboursés dans la
    période ÷ ventes nettes HT de la période avant remboursements. Il peut dépasser 100 % sur
    une période creuse, cas rare accepté.
  - Raisons : les trois plateformes exposent le remboursement comme un objet distinct, avec sa
    date et ses lignes (`refunds` de WooCommerce, `Refund` de Shopify, `order_slip` de
    PrestaShop). WooCommerce Analytics et Shopify l'imputent à sa date (« on the date that the
    return occurred (not the date the order was placed) » ; « for the day that they were
    processed ») et le déduisent des « Net sales ». Un taux en montant pèse un remboursement
    partiel à sa juste valeur.
  - Alternatives écartées : un statut `refunded` (D6) ; l'imputation à la date de la commande,
    qui ferait baisser une période déjà consultée ; un taux en nombre de commandes remboursées,
    qui avantage la période en cours, faute de recul, et change après coup.
  - À reprendre : un remboursement WooCommerce peut n'avoir qu'un montant, sans lignes (question
    des produits) ; chez Shopify, un `Refund` « doesn't guarantee that the money has been
    returned », le connecteur vérifie le statut de ses transactions (phase B).
- **D12 (2026-11-23) — Fuseau horaire** :
  - les instants sont stockés en UTC ; chaque connecteur convertit depuis le format de sa
    plateforme, et le domaine ne manipule jamais d'heure locale ambiguë ;
  - chaque organisation a un fuseau IANA, `Europe/Paris` par défaut, modifiable par un
    propriétaire ou un administrateur. Tous les indicateurs découpent dans ce fuseau : jours,
    semaines ISO (du lundi au dimanche) et mois civils ;
  - une boutique réglée sur un autre fuseau est découpée dans celui de l'organisation : une
    seule horloge permet d'additionner les boutiques. Ses chiffres journaliers peuvent différer
    de son back-office, écart accepté. Le fuseau de la boutique est conservé (affichage,
    conversion des dates PrestaShop) ;
  - un jour local reste un jour, de 23 h ou de 25 h aux changements d'heure : les moyennes
    journalières se font par jour calendaire ; dans une répartition horaire, la tranche de 2 h
    manque au printemps et compte double à l'automne. Le value object `localDay` (phase C)
    porte ces bornes ;
  - la comparaison N-1 porte sur la même plage de dates locales un an plus tôt ;
  - changer le fuseau d'une organisation recalcule ses agrégats journaliers pré-calculés, quand
    ils existeront (« Indicateurs côté serveur »).
  - Raisons : la vision veut que toute l'équipe du commerçant consulte les mêmes chiffres, ce
    qu'un fuseau par utilisateur empêcherait pour « hier ». Les plateformes donnent de quoi
    convertir en UTC : `ianaTimezone` de la boutique et dates ISO 8601 chez Shopify, dates en
    double locale et GMT (`date_paid_gmt`) chez WooCommerce.
  - Alternatives écartées : le fuseau du navigateur de chaque utilisateur ; le découpage de
    chaque boutique dans son propre fuseau (le « lundi » du total mêlerait des fenêtres de 24 h
    différentes).
  - À reprendre : la documentation de PrestaShop ne dit ni le fuseau de ses dates (`date_add`
    sans décalage) ni comment lire le fuseau de la boutique, point du jalon de son connecteur ;
    celle de Shopify ne garantit pas des dates en UTC, le connecteur lit le décalage de chaque
    date. L'interface actuelle découpe les jours en UTC (`dateRangePresets.ts`) : écart noté en
    phase B, corrigé au jalon « Indicateurs côté serveur ».
- **D13 (2026-11-24) — Produits** :
  - l'analyse se fait au niveau du produit ; la variante est conservée sur la ligne de commande
    (identifiant externe et libellé), pour un futur détail par variante ;
  - la ligne de commande est une photo prise à la commande : nom, SKU, quantité, prix unitaire
    HT après remises (D10) et identifiants externes du produit et de la variante. Un changement
    de prix ou de nom ultérieur ne réécrit pas l'historique ;
  - un produit supprimé côté plateforme garde ses ventes passées ; il est marqué supprimé dans
    le catalogue et sort des produits jamais vendus et de la couverture du catalogue. Une
    commande importée sans référence produit (produit déjà supprimé à l'import de l'historique)
    est regroupée par son nom figé ;
  - les catégories restent propres à chaque boutique, sans référentiel commun. Toutes sont
    conservées, mais une seule catégorie principale par produit sert aux indicateurs, pour que
    la somme des catégories reste égale au chiffre d'affaires. La règle de choix appartient au
    connecteur : `id_category_default` chez PrestaShop, `productType` puis `category` chez
    Shopify ; WooCommerce, sans catégorie principale, se tranche au jalon de son connecteur.
    Dans la vue « toutes boutiques », deux catégories de même libellé (casse et espaces
    ignorés) sont regroupées ;
  - pas d'identité de produit d'une boutique à l'autre : le SKU est facultatif et rien ne
    garantit son unicité. Un même article vendu dans deux boutiques apparaît deux fois dans la
    vue « toutes boutiques » ;
  - un remboursement sans lignes (possible chez WooCommerce et chez Shopify, reste de D11)
    réduit le chiffre d'affaires mais n'est pas réparti entre les produits : le total par
    produit peut alors dépasser légèrement le chiffre d'affaires ;
  - le catalogue est synchronisé (produits, variantes, catégories, état supprimé), et pas
    seulement déduit des commandes : les produits jamais vendus et la couverture du catalogue
    en ont besoin.
  - Raisons : les trois plateformes référencent la variante sur la ligne (`variation_id` chez
    WooCommerce, `variant` chez Shopify, `product_attribute_id` chez PrestaShop). Shopify fige
    le nom à la commande (`title`, « at time of order creation ») et sa référence `product` est
    nullable. Les catégories n'ont pas la même forme : liste sans catégorie principale chez
    WooCommerce, `id_category_default` chez PrestaShop, `productType` libre, `category` de la
    taxonomie standard et collections chez Shopify.
  - Alternatives écartées : compter un produit dans chacune de ses catégories (la somme
    dépasserait le chiffre d'affaires) ; répartir un remboursement sans lignes au prorata des
    lignes (un chiffre par produit inventé) ; regrouper les produits de plusieurs boutiques par
    SKU, piste possible plus tard.
- **D14 (2026-11-24) — Clients** :
  - dans une boutique, un client est identifié par l'empreinte de son e-mail ; l'identifiant
    externe est conservé comme attribut. Une personne qui commande en invité puis avec un compte
    reste un seul client. Une commande sans e-mail a un client inconnu : elle compte dans le
    chiffre d'affaires, pas dans les indicateurs clients ;
  - dans une organisation, la même empreinte désigne la même personne d'une boutique à l'autre
    (P15) : en vue « toutes boutiques », un client qui achète dans deux boutiques compte une
    fois ; filtré sur une boutique, il compte dans celle-ci ;
  - l'empreinte est un HMAC-SHA256 de l'e-mail normalisé (minuscules, espaces retirés, sans
    autre retouche des alias), avec un secret propre à chaque organisation, dérivé d'une clé
    maîtresse comme la clé de chiffrement de P16. Les empreintes ne se recoupent pas d'une
    organisation à l'autre (P11). Changer le secret impose de resynchroniser les boutiques,
    puisque les e-mails ne sont pas conservés : cas rare accepté ;
  - la date d'arrivée d'un client est la date de création de son compte sur la plateforme
    quand il en a un, sinon celle de sa première commande ;
  - la localisation se limite au pays (ISO 3166-1 alpha-2), lu dans l'adresse de livraison,
    sinon de facturation : aucun indicateur n'a besoin de la ville aujourd'hui, et P15 limite la
    donnée à ce dont un indicateur a besoin. L'ajouter plus tard demandera de resynchroniser
    l'historique ;
  - les listes de clients n'affichent pas de nom : l'identifiant externe de la boutique
    (« Client n° 1042 »), que le commerçant retrouve dans son back-office, ou « Client invité »
    suivi d'un court extrait de l'empreinte.
  - Raisons : les trois plateformes acceptent des commandes sans compte (`customer_id` « 0 for
    guests » chez WooCommerce, `customer` nul chez Shopify, `is_guest` chez PrestaShop), et
    Shopify peut ne pas fournir d'e-mail (« if no email address was provided »). L'e-mail est
    le seul repère commun aux invités et aux comptes, et d'une boutique à l'autre.
  - Alternatives écartées : l'identifiant externe d'abord (les commandes invitées dédoubleraient
    les clients) ; un SHA-256 sans secret, inversible par dictionnaire d'e-mails ; un secret
    commun à toutes les organisations, qui rendrait deux commerçants recoupables ; garder la
    ville dès maintenant, permis par P15 mais sans usage.
  - Écart à noter en phase B : les listes « Meilleurs clients » affichent aujourd'hui le nom du
    client (`TopCustomers.tsx`, `TopCustomersByOrderCount.tsx`).
- **D15 (2026-11-24) — Canal et appareil des commandes** : le canal d'acquisition et l'appareil
  sortent du modèle de commande du MVP. Ils sont rattachés à la piste « Analytics réel », qui
  choisira leur source : un connecteur analytics relié aux commandes par leur identifiant, avec
  en complément éventuel l'attribution des plateformes. Les champs `channel` et `device` de la
  démo, et les indicateurs qui s'en servent, restent propres à la démo : écart noté en phase B.
  La phase D complète la piste « Analytics réel » de la roadmap.
  - Raisons : ce sont des données de visite, qui relèvent du contexte analytics, distinct des
    commandes. Les plateformes les fournissent mal : WooCommerce seulement quand sa fonction
    « Order Attribution » est activée (source, UTM, appareil, dans les métadonnées
    `_wc_order_attribution…`), Shopify sans appareil (`customerJourneySummary`), PrestaShop
    pas du tout. Le MVP afficherait surtout « inconnu », avec des chiffres non comparables d'une
    boutique à l'autre. Une source analytics donnerait une seule règle d'attribution pour toutes
    les plateformes, PrestaShop compris. L'attribution des plateformes reste stockée sur leurs
    commandes, relisible plus tard.
  - Conséquence acceptée : pas de chiffre d'affaires par canal dans le MVP, même pour une
    boutique WooCommerce dont l'attribution est activée.
  - Alternative écartée : deux champs facultatifs sur la commande, avec une valeur « inconnu »,
    remplis par chaque connecteur selon ce que fournit sa plateforme.
- **D16 (2026-11-24) — Ventes, un seul bounded context** : commande avec ses lignes,
  remboursement, produit avec ses catégories et client forment quatre aggregates d'un même
  contexte `sales`, qui se référencent par identifiant. Un sous-ensemble en sortira s'il prend
  des règles étrangères aux ventes (stocks, coûts et marges pour un catalogue ; segmentation ou
  consentements pour les clients).
  - Raisons : un seul langage (un produit n'existe que pour analyser ses ventes, D13, un client
    que pour analyser ses commandes, D14), une seule source (la même synchronisation), des
    indicateurs qui croisent les trois (meilleurs produits, nouveaux clients, LTV) et une seule
    personne pour les faire évoluer.
  - Alternative écartée : trois contextes Commandes, Catalogue et Clients ; presque chaque
    indicateur aurait traversé deux frontières, avec des ports et des identifiants recopiés,
    sans règle protégée en échange.
- **D17 (2026-11-24) — Indicateurs croisés dans Analytics** : les indicateurs qui combinent
  ventes et données de visite ou de publicité (taux de conversion, CAC, ROAS) relèvent du
  contexte `analytics`, qui lit Ventes par son `index.ts`. Ventes ne connaît pas l'analytics.
  - Raisons : la dépendance va dans un seul sens, et la piste « Analytics réel » ne changera
    que les adapters d'analytics, pas Ventes.
- **D18 (2026-11-24) — Empreinte client calculée dans l'adapter** : l'adapter de chaque
  plateforme calcule l'empreinte de l'e-mail (D14) avant d'appeler Ventes ; l'e-mail en clair ne
  sort jamais du contexte Boutiques et synchronisation, et aucun use case de Ventes ne le reçoit.
  - Raison : P15 tient par construction, un use case de Ventes ne pouvant pas stocker un e-mail
    qu'il ne reçoit pas.
- **D19 (2026-11-24) — Composition root unique** : un seul module, à la racine
  d'`apps/api/src/`, importe l'infrastructure de plusieurs contextes ; il instancie les
  adapters, les injecte dans les use cases et monte les routes de chaque contexte. Son nom et le
  point d'entrée du serveur sont tranchés au jalon « Serveur API ».
  - Raison : le branchement des adapters est écrit en un seul endroit, sans conteneur
    d'injection ni framework, et les use cases restent testables avec d'autres adapters.
- **D20 (2026-11-24) — Contenu de l'`index.ts` d'un contexte** : il exporte les use cases et les
  types et value objects de leurs entrées et sorties, jamais un repository ni un adapter. Un
  contexte qui en appelle un autre reçoit son use case par injection, comme un port, et ne
  l'importe que pour son type.
  - Alternative écartée : un port défini par le contexte appelant et implémenté par le contexte
    appelé ; avec le typage structurel de TypeScript, ce serait une interface identique de plus,
    sans gain.
- **D21 (2026-11-24) — Tests et adapters en mémoire** : les règles d'imports de D3 ne
  s'appliquent pas aux `*.test.ts`, qui importent `vitest` et les adapters en mémoire. Ces
  adapters (`InMemoryOrderRepository`…) vivent dans `infrastructure/`, comme tout adapter de
  leur port.
  - Raisons : sans exemption, la règle « aucun paquet externe dans `domain/` » interdirait aux
    tests du domaine d'importer `vitest` ; les adapters en mémoire peuvent servir au jalon
    « Serveur API », avant la base de données.
- **D22 (2026-11-24) — `domain/` à plat** : un fichier par entity ou value object, nommé en
  camelCase comme dans le web (`orderStatus.ts`), sans sous-dossier pour l'instant. Le passage
  à un sous-dossier par aggregate se décide au premier aggregate codé (jalon « Synchronisation »).
  - Raison : la phase C ne crée que trois fichiers ; une arborescence par aggregate serait
    décidée avant d'en avoir un seul.
- **D23 (2026-11-24) — Identifiant interne** : chaque racine d'aggregate a un UUID, généré par
  l'application à travers un port, que les tests remplacent par un générateur déterministe. Sa
  version (v7, ordonnée dans le temps, favorable aux index) se tranche au jalon « Base de
  données ». Les entities internes (lignes, variantes) n'ont pas d'identifiant interne : leur
  référence externe suffit dans leur aggregate.
- **D24 (2026-11-24) — Référence externe** : l'identifiant d'une donnée sur sa plateforme est
  une chaîne de caractères, unique dans une boutique pour chaque type d'aggregate. La
  synchronisation fait un upsert idempotent sur (boutique, référence externe) : resynchroniser
  met à jour, sans dupliquer. Le numéro de commande affiché est un attribut distinct (`number`
  chez WooCommerce, `name` chez Shopify, `reference` chez PrestaShop).
  - Raison : les formats diffèrent (entiers chez WooCommerce et PrestaShop, GID
    `gid://shopify/Order/…` chez Shopify) ; une chaîne les accueille tous.
- **D25 (2026-11-24) — Références entre aggregates de Ventes** : la ligne de commande désigne
  son produit et sa variante, le remboursement sa commande, par leur référence externe dans la
  boutique ; la commande désigne son client par son empreinte. L'UUID sert à l'identité, à l'API
  et aux journaux, pas à relier les données synchronisées.
  - Raisons : catalogue, commandes et remboursements arrivent dans n'importe quel ordre (un
    remboursement synchronisé avant sa commande, un produit déjà supprimé, D13) ; aucune
    résolution d'identifiant n'est nécessaire à l'écriture.
  - Alternative écartée : résoudre l'UUID de la cible à l'écriture, qui impose un ordre de
    synchronisation et laisse des références vides quand la cible manque.
- **D26 (2026-11-24) — Remboursement, aggregate à part** : il complète D11, qui en laissait la
  place ouverte. Il ne modifie jamais sa commande.
  - Raisons : il arrive après la commande et s'impute à sa propre date ; l'inclure dans la
    commande obligerait à la recharger et à la réécrire à chaque remboursement, sans invariant
    commun à protéger, les plateformes contrôlant déjà le montant remboursable.
- **D27 (2026-11-24) — Client par boutique** : un client est unique sur (boutique, empreinte).
  Son identité dans l'organisation est l'empreinte elle-même : la vue « toutes boutiques »
  regroupe par empreinte, avec la date d'arrivée la plus ancienne (D14). L'identifiant externe
  est un attribut, sans unicité. Une commande sans e-mail a une empreinte nulle et pas de
  client.
  - Raisons : l'identifiant externe et la date de création du compte sont propres à chaque
    boutique.
  - Conséquence acceptée : un client qui change l'e-mail de son compte devient un nouveau
    client, l'identification se faisant par l'e-mail de la commande.
  - Alternative écartée : un client par organisation avec un profil par boutique, une entity de
    plus pour ce qu'un regroupement par empreinte donne déjà.
- **D28 (2026-11-24) — Organisation sur chaque aggregate** : chaque aggregate porte
  l'identifiant de son organisation, même quand il se déduit de sa boutique.
  - Raisons : toute lecture filtre d'abord par organisation (P11), sans jointure ; une sécurité
    au niveau des lignes reste possible au jalon « Base de données ».
- **D29 (2026-11-24) — Catégorie, aggregate à part** : une catégorie a sa référence externe et
  son libellé ; le produit désigne ses catégories et sa catégorie principale par référence
  externe (D25). La référence externe des `productType` de Shopify, qui ne sont pas des
  entities, se tranche au jalon de son connecteur.
  - Raison : renommer une catégorie chez WooCommerce ne modifie pas ses produits ; un libellé
    copié sur le produit échapperait à une synchronisation incrémentale des produits.
- **D30 (2026-11-24) — Unicité d'une boutique** : une boutique est unique sur (organisation,
  plateforme, identifiant de la boutique sur sa plateforme). Deux organisations peuvent
  connecter la même boutique (une agence et le commerçant), chacune avec ses données (P11).
- **D31 (2026-11-24) — Forme des value objects** : types en lecture seule, marqués (branded),
  produits par une fonction de fabrique qui vérifie l'invariant (`money()` produit un `Money`),
  sans classes.
  - Raisons : style fonctionnel déjà employé dans `lib/kpis` ; les valeurs se sérialisent sans
    conversion (JSON, base de données) et se comparent par valeur.
  - Alternative écartée : des classes à champs privés, qui protègent autant l'invariant mais
    demandent des `equals()` et une conversion à chaque frontière.
- **D32 (2026-11-24) — Erreurs du domaine** : une valeur invalide lève une `DomainError`, une
  seule classe avec un code (`invalid-money`, `currency-mismatch`…). L'adapter l'attrape et
  l'inscrit dans le journal de la synchronisation sans l'arrêter.
  - Raison : les données des plateformes sont validées par l'adapter ; une erreur du domaine
    signale un bug ou un cas imprévu.
  - Alternative écartée : un type `Result`, que chaque appel devrait propager pour des erreurs
    qui ne devraient pas arriver.
- **D33 (2026-11-24) — `Money`** : montant en `number` entier sûr (`Number.isSafeInteger`),
  négatif admis ; toute devise ISO 4217 reconnue par `Intl`, avec son nombre de décimales ;
  addition et soustraction dans la même devise seulement ; ni multiplication ni division.
  - Raisons : 9 × 10¹³ euros suffisent et un `number` passe en JSON sans conversion ; un
    chiffre d'affaires net peut être négatif sur une période ; la restriction à l'euro
    (jalon 007, D11) est une règle de la boutique, et le multi-devises est prévu (jalon 007,
    D17) ; les totaux viennent des plateformes et les taux se calculent à la lecture.
  - Alternative écartée : `bigint`, sans besoin à ces montants et converti à chaque frontière.
- **D34 (2026-11-24) — Instants et jours locaux** : les instants sont des `Date` en UTC, jamais
  modifiées après création (convention, la lint ne pouvant pas l'imposer) ; `LocalDay` est une
  chaîne `AAAA-MM-JJ`, comparable dans l'ordre alphabétique, avec ses bornes en instants
  [début, début du lendemain[. Les fuseaux se calculent par `Intl`, sans bibliothèque.
  - Alternative écartée pour l'instant : l'API `Temporal`, plus adaptée, mais que Node 24
    n'active pas par défaut ; à réévaluer.
- **D35 (2026-11-24) — Empreinte client** : le value object `CustomerFingerprint` vit dans
  Ventes et passe par son `index.ts` (D20) ; il ne vérifie que le format (64 caractères
  hexadécimaux en minuscules). La normalisation de l'e-mail et le calcul HMAC restent dans
  l'adapter (D18) ; l'extrait court affiché pour un client invité (D14) se calcule à la
  lecture.
- **D36 (2026-11-24) — Invariants des entities de Ventes** : une commande `paid` a une date de
  paiement ; tous les montants d'une commande et de ses lignes, ou d'un remboursement et de ses
  lignes, sont dans la même devise ; la quantité d'une ligne de commande est un entier
  strictement positif ; les montants d'un remboursement sont positifs ou nuls, soustraits à la
  lecture.
- **D37 (2026-11-24) — CQRS léger** : une seule base et les mêmes tables. L'écriture passe par
  les aggregates et leurs repositories ; la lecture par des ports de requête (`SalesQueries`…)
  définis dans `application/` et implémentés en SQL dans `infrastructure/`, qui renvoient des
  read models simples (nombres, séries) convertis au format du contrat par l'adapter HTTP (D5).
  - Alternatives écartées : une base de lecture séparée et l'event sourcing, que le volume visé
    (quelques dizaines de milliers de commandes par organisation) ne justifie pas.
- **D38 (2026-11-24) — Champs dérivés calculés à l'écriture** : le domaine calcule et stocke
  les champs dont la lecture a besoin : `countsInIndicators` (D7), jour local du paiement
  (D12) et ventes nettes HT (D10) de la commande ; ventes nettes HT de la ligne ; jour local et
  montant HT des produits remboursés (D11) du remboursement ; jour local d'arrivée du client
  (D14). Le SQL filtre, additionne et regroupe ces champs, sans réimplémenter de règle (jamais
  `status = 'paid'` ni `gross - discounts`).
  - Raisons : une règle n'existe qu'une fois, en TypeScript, testée en TDD ; un jour stocké
    s'indexe et se regroupe directement.
  - Alternative écartée : le jour local calculé en SQL (`AT TIME ZONE`), règle écrite deux fois,
    avec des bases de fuseaux de PostgreSQL et de Node qui peuvent différer d'une version à
    l'autre.
- **D39 (2026-11-24) — Recalcul des champs dérivés** : un use case les recalcule à partir des
  données stockées (statut brut, composantes, instants) quand une règle, une correspondance de
  statut ou le fuseau de l'organisation change, sans resynchroniser (D6, D10, D12).
- **D40 (2026-11-24) — Période de lecture en jours locaux** : les requêtes de lecture prennent
  une plage de `LocalDay` dans le fuseau de l'organisation, pas des instants (D12). L'interface
  envoie aujourd'hui des instants `from` et `to` : écart noté dans `docs/domain-model.md`.
- **D41 (2026-11-24) — Lecture limitée aux tables de son contexte** : un indicateur croisé
  (taux de conversion, CAC) se compose dans l'application d'Analytics, à partir d'une requête de
  Ventes appelée par son `index.ts` et d'une requête d'Analytics (D17).
  - Alternative écartée : une jointure SQL entre les tables de deux contextes, plus rapide mais
    qui couplerait leurs schémas.
- **D42 (2026-11-24) — Ni pré-agrégation ni doublure en mémoire pour l'instant** : les requêtes
  portent sur les tables, avec des index sur (organisation, jour local). Des agrégats
  journaliers pré-calculés s'ajouteront au jalon « Indicateurs côté serveur » si les temps
  mesurés le demandent. Les adapters de lecture se testent contre une vraie PostgreSQL (base
  jetable, jalon « Base de données ») : une version en mémoire recopierait le SQL en TypeScript.
- **D43 (2026-11-24) — Paiement acquis** : le statut canonique se déduit de la date de
  paiement (D9). Date connue : `paid`, même si la commande est ensuite annulée ou marquée
  remboursée sur la plateforme ; l'argent rendu passe par les remboursements, imputés à leur
  date (D11). Sans date de paiement : le statut brut donne `pending`, `failed` ou `cancelled`.
  Une date de paiement connue n'est jamais effacée par une synchronisation suivante. L'invariant
  de D36 devient une équivalence : une commande est `paid` si et seulement si elle a une date de
  paiement.
  - Raisons : une commande payée puis annulée ne fait pas baisser une période déjà consultée
    (D9, P6) et un remboursement qui accompagne l'annulation n'est pas déduit deux fois ; un
    statut personnalisé inconnu compte dès qu'il a une date de paiement. Les plateformes disent
    elles-mêmes que l'argent se rend par un remboursement (« To return funds to the customer you
    will need to issue a refund » chez WooCommerce ; remboursement coché par défaut à
    l'annulation chez Shopify).
  - Conséquences acceptées :
    - une commande annulée après paiement, remboursée hors de la plateforme sans remboursement
      enregistré, reste dans le chiffre d'affaires ; le chiffre diffère alors de WooCommerce
      Analytics (qui exclut les commandes `cancelled` par défaut) et des statistiques de
      PrestaShop (fondées sur `valid`, qui retombe à 0 à l'annulation) ;
    - une commande passée par erreur dans un statut payé se corrige par un remboursement
      enregistré, pas par un changement de statut ;
    - si WooCommerce efface `date_paid` à l'annulation (à vérifier au jalon de son connecteur),
      une commande importée avec l'historique serait vue comme jamais payée, alors qu'une
      commande suivie en continu garde son paiement.
  - Pour le commerçant : le statut brut conservé (D6) permet d'afficher « Annulée après
    paiement » ; un indicateur des commandes annulées après paiement sans remboursement
    enregistré (nombre, montant) lui signale ce qu'il doit régulariser. Suggestion pour le jalon
    « Indicateurs côté serveur », sans changement du modèle.
  - Alternatives écartées : un statut qui suit la plateforme (périodes passées qui baissent,
    remboursements déduits deux fois) ; un remboursement implicite à la date d'annulation,
    compté deux fois quand un vrai remboursement arrive plus tard (« Refund later » de Shopify).
- **D44 (2026-11-24) — Correspondance de WooCommerce** : date de paiement `date_paid_gmt`
  (D9). Sans date de paiement : `pending` et `on-hold` donnent `pending`, `failed` donne
  `failed`, `cancelled` donne `cancelled` ; un statut personnalisé donne `pending` et est
  signalé dans le journal de la synchronisation. Les brouillons de checkout ne sont pas
  synchronisés. `processing`, `completed` et `refunded` ont normalement une date de paiement.
- **D45 (2026-11-24) — Correspondance de Shopify** : date de paiement : `processedAt` de la
  transaction `SALE` ou `CAPTURE` en `SUCCESS` qui solde la commande (point de D9). `PAID`,
  `PARTIALLY_REFUNDED` et `REFUNDED` donnent `paid`, annulée ou non ; `PENDING`, `AUTHORIZED`
  (D7) et `PARTIALLY_PAID` donnent `pending`, ou `cancelled` si `cancelledAt` est renseigné ;
  `EXPIRED` donne `failed` ; `VOIDED` donne `cancelled`.
  - `PARTIALLY_PAID` reste `pending` par prudence (D7) : une capture partielle définitive ne
    compterait jamais, cas rare repris au jalon du connecteur Shopify.
- **D46 (2026-11-24) — Correspondance de PrestaShop** : par l'indicateur `paid` de l'état
  (« Set the order as paid »), pas par `logable` (« Consider the associated order as
  validated », qui alimente `valid`). Date de paiement : premier état `paid` de
  `order_histories` (D9). Sans date de paiement : l'état configuré dans `PS_OS_ERROR` donne
  `failed`, celui de `PS_OS_CANCELED` donne `cancelled`, tout autre état `pending`. Les états
  créés par le commerçant suivent la même règle.
  - Raison : l'état « En rupture (payé) » a `paid` à 1 et `logable` à 0 ; l'argent est encaissé
    (D7). Les chiffres compteront ces commandes, contrairement aux statistiques de PrestaShop.
- **D47 (2026-11-25) — Devises ISO 4217, remplace D33 sur ce point** : devises acceptées et
  nombre de décimales lus dans une table de la liste ISO 4217 (« List One » de la SIX) recopiée
  dans le code, et non plus dans `Intl` ; les codes sans unités mineures (métaux, unités de
  compte, `XTS`, `XXX`) sont refusés.
  - Raison : `Intl` donne les décimales d'affichage de CLDR, pas les unités mineures (0 pour
    HUF, IDR, COP ou IQD, contre 2 ou 3 dans ISO 4217), et sa liste suit la version d'ICU
    (`VED` refusé, `HRK` retiré accepté sous ICU 78.3) ; relevé par une revue de code.
  - Coût : la table se met à jour à la main quand la liste change, rarement.
- **D48 (2026-11-25) — Value object à valeurs fermées, remplace D31 sur ce point** : un value
  object dont les valeurs forment une liste fermée (`OrderStatus`) est une union de littéraux
  tirée d'un tableau `as const` figé (`Object.freeze`), sans marque ; sa fonction de fabrique
  valide une chaîne venue de l'extérieur du domaine (base, adapter). D31 reste la règle des
  autres value objects.
  - Raison : le compilateur refuse déjà toute autre chaîne ; une marque obligerait à passer par
    la fabrique jusque dans le code qui écrit un statut en dur (`status === 'paid'`), sans
    invariant de plus à protéger.

## Phase A — Définitions métier ✅

Brainstorm avec l'utilisateur : une décision par question, avec les pratiques des plateformes
(WooCommerce, Shopify, PrestaShop) vérifiées dans leur documentation.

- [x] Statuts canoniques d'une commande : liste, distinction paiement / expédition, et règle
      « la commande compte dans les indicateurs ». Devenir des paniers abandonnés et des
      paiements échoués, qui ne sont pas toujours des commandes côté plateforme.
- [x] Date de référence d'une commande : création, paiement ou finalisation.
- [x] Chiffre d'affaires : HT ou TTC, livraison incluse ou non, remises déduites ; composantes
      conservées pour qu'une définition puisse changer sans resynchroniser.
- [x] Remboursements, totaux et partiels : entity distincte ou non, date d'imputation (celle de
      la commande ou du remboursement), effet sur le chiffre d'affaires et sur le taux de
      remboursement.
- [x] Fuseau horaire : un fuseau IANA par organisation (Europe/Paris par défaut), découpage des
      jours, semaines et mois dans ce fuseau, jours de 23 h et de 25 h aux changements d'heure,
      boutiques réglées sur un autre fuseau.
- [x] Produits : niveau d'analyse (produit ou variante), catégories propres à chaque boutique,
      prix à la ligne de commande et produit supprimé côté plateforme.
- [x] Clients : identité dans une boutique et d'une boutique à l'autre (identifiant externe,
      empreinte de l'e-mail et son secret), commandes sans compte, localisation conservée.
- [x] Canal et appareil des commandes : source quand la plateforme les fournit, valeur
      « inconnu » sinon.

## Phase B — Document du modèle ✅

- [x] `docs/domain-model.md` : bounded contexts (organisations et accès, ventes, boutiques et
      synchronisation, analytics simulé, facturation à venir) et leurs relations.
- [x] `docs/domain-model.md` : architecture hexagonale d'`apps/api` (D3) : couches, ports et
      adapters, règle d'imports.
- [x] `docs/domain-model.md` : entities et aggregates (organisation, boutique, commande et ses
      lignes, remboursement, produit, client), leurs identifiants internes et externes, et
      l'unicité d'un identifiant externe dans une boutique.
- [x] `docs/domain-model.md` : value objects (montant et devise, statut canonique, empreinte
      client, fuseau horaire, jour local, référence externe) et leurs invariants.
- [x] `docs/domain-model.md` : écriture par le domaine (synchronisation) et lecture des
      indicateurs par agrégats SQL ; comment les règles du domaine s'appliquent à la lecture
      sans être dupliquées (champs calculés à l'écriture, par exemple « compte dans le CA »).
- [x] `docs/domain-model.md` : correspondance des statuts de WooCommerce, de Shopify et de
      PrestaShop vers les statuts canoniques, vérifiée dans leur documentation.
- [x] `docs/domain-model.md` : écarts avec les schémas actuels de `@salespulse/contracts` et
      jalon qui comble chacun (D1, D5).

## Phase C — Value objects en TypeScript 🔄

TDD : test rouge lancé et montré avant chaque code de production.

- [x] `apps/api` : squelette du paquet `@salespulse/api`, sans Express ni serveur
      (`package.json`, `tsconfig.json` qui étend `tsconfig.base.json`, `vitest.config.mts`,
      script `typecheck`), couverture de `apps/api/src/**`.
- [x] `package.json` racine : `npm test` et `test:coverage` lancent chaque workspace qui a un
      script `test` (`--workspaces --if-present`), donc le CI aussi, sans retouche quand
      `contracts` aura ses premiers tests (D5) ; `test:watch` retiré de la racine (voir
      Journal).
- [x] `eslint.config.mjs` : `no-restricted-imports` par chemin (D3) : `domain/` n'importe ni
      `application/`, ni `infrastructure/`, ni aucun paquet externe ; `application/`
      n'importe ni `infrastructure/`, ni aucun paquet externe ; `shared/domain/` n'importe
      aucun contexte ; un contexte n'en importe un autre que par son `index.ts` ; les
      `*.test.ts` sont exemptés (D21). Chaque interdiction est prouvée par un import interdit
      temporaire qui fait échouer `npm run lint`, sortie montrée, puis retiré.
- [x] `apps/api/src/shared/domain/money.ts` : montant entier en unités mineures avec son code
      ISO 4217 ; refus d'un montant non entier ; addition et soustraction refusées entre deux
      devises ; nombre de décimales propre à la devise.
- [x] `apps/api/src/sales/domain/orderStatus.ts` : statuts canoniques et règle « compte dans
      les indicateurs », selon la phase A.
- [ ] `apps/api/src/shared/domain/localDay.ts` : jour local d'un instant dans un fuseau IANA,
      bornes d'un jour local en instants (jours de 23 h et de 25 h, passage d'année).

## Phase D — Documentation durable ⬜

- [ ] `CLAUDE.md` : structure du dépôt (`apps/api`), architecture hexagonale et règle d'imports
      (D3), rôle de `@salespulse/contracts`, nommage par usage et règle de test (D5), renvoi
      vers `docs/domain-model.md`, commandes de test (racine et fichier d'`apps/api`), watch
      par paquet (`npm run test:watch -w <paquet>`).
- [ ] `docs/vision.md` et `docs/stack.md` relus : un principe touché par la phase A (P9, P15) ou
      une dépendance nouvelle (fuseaux horaires) les met à jour ; entrée Zod de la stack
      alignée sur D5.
- [ ] `docs/roadmap.md` : « Serveur API » sans les conventions TDD d'`apps/api`, faites ici ;
      « Synchronisation » et « Indicateurs côté serveur » complétés par le calendrier de D5 ;
      piste « Découpage des contrats par contexte » ajoutée aux autres pistes, à faire juste
      après ce jalon, avec la répartition du contenu actuel (`shops.ts` : `Shop` ; `sales.ts` :
      commandes, lignes, produits, clients, catégories ; `analytics.ts` : canal, appareil et
      lignes analytics ; `demo.ts` : `Dataset`, `AnalyticsDataset` ; `shared.ts` créé au
      premier format commun) ; pistes « Paniers abandonnés réels » (D8) et « Analytics réel » (D15)
      ajoutée ou complétée ; « Indicateurs côté serveur » complété par le panier moyen et le
      chiffre d'affaires par client avant ou après remboursements (renvoyés) et par
      l'indicateur des commandes annulées après paiement sans remboursement (D43) ; points à
      vérifier de `docs/domain-model.md` rattachés aux jalons des connecteurs ; sujets
      tranchés retirés.

## Journal

- 2026-11-20 : plan rédigé. Avant validation, D3 révisée : le paquet `packages/domain` d'abord
  proposé est abandonné au profit d'un cœur hexagonal dans `apps/api`, car il coupait chaque
  contexte en deux. D5 ajoutée après examen de `@salespulse/contracts` (un seul consommateur
  aujourd'hui, contenu mélangé) ; son découpage par contexte est reporté à une branche dédiée.
- 2026-11-20 : plan validé par l'utilisateur.
- 2026-11-23 : phase A commencée. Documentation des trois plateformes relue (statuts de
  WooCommerce, `OrderDisplayFinancialStatus` et `OrderDisplayFulfillmentStatus` de Shopify,
  états de commande de PrestaShop 8). Lacunes à reprendre en phase B : la documentation de
  WooCommerce ne dit rien des statuts personnalisés, et celle de PrestaShop 8 ne donne pas les
  identifiants des états par défaut. Les paniers abandonnés ne sont des commandes sur aucune des
  trois plateformes. D6, D7 et D8 tranchées : statuts canoniques terminés. En relisant les
  KPIs, `paymentFailureRate.ts` s'est révélé calculé sur les erreurs de l'analytics simulé, pas
  sur les commandes : formulation de D8 précisée. D9 tranchée, puis D10 après lecture des
  champs de montant des trois plateformes et des définitions « Gross / Net / Total sales » de
  WooCommerce Analytics et de Shopify, identiques chez les deux. D11 tranchée après lecture des
  ressources de remboursement des trois plateformes. D12 tranchée ; découverte : l'interface
  actuelle découpe les jours en UTC.
- 2026-11-24 : D13 tranchée après lecture des lignes de commande, produits et catégories des
  trois plateformes. D14 tranchée ; découverte : les listes « Meilleurs clients » affichent le
  nom du client, contre P15. D15 tranchée à la demande de l'utilisateur : canal et appareil
  rattachés à la piste « Analytics réel ». Phase A terminée.
- 2026-11-24 : phase B commencée. Carte des bounded contexts tranchée (D16 à D18) ; NestJS
  réexaminé à la demande de l'utilisateur et laissé écarté (entrée Express de `docs/stack.md`) :
  l'architecture hexagonale cantonne le framework HTTP à l'infrastructure.
- 2026-11-24 : architecture hexagonale tranchée (D19 à D22), après comparaison avec
  l'architecture en couches, les vertical slices et le transaction script. Case ESLint de la
  phase C complétée : aucun paquet externe dans `application/`, aucun contexte dans
  `shared/domain/`, exemption des tests (D21).
- 2026-11-24 : entities et aggregates tranchés (D23 à D30). Le remboursement devient un
  aggregate à part (D26), point laissé ouvert par D11.
- 2026-11-24 : value objects et invariants tranchés (D31 à D36) ; les cases de la phase C
  restent compatibles sans retouche.
- 2026-11-24 : écriture et lecture tranchées (D37 à D42). Découverte : une commande payée puis
  annulée cesserait de compter, ce qui ferait baisser une période déjà consultée (contre D9) et
  pourrait déduire deux fois un remboursement ; cas repris avec la correspondance des statuts.
- 2026-11-24 : documentation des statuts relue (WooCommerce, Shopify, PrestaShop). Les états
  par défaut de PrestaShop, absents de sa documentation, sont lus dans les données
  d'installation du dépôt officiel (`install-dev/data/xml/order_state.xml` et
  `configuration.xml`, branche `8.2.x`, le chemin `8.1.x` n'existant plus). Découverte : l'état
  « En rupture (payé) » a `paid` à 1 et `logable` à 0. D43 à D46 tranchées. À la demande de
  l'utilisateur, le panier moyen et le chiffre d'affaires par client, avant ou après
  remboursements (D10 et D11 ne le disent pas), sont renvoyés au jalon « Indicateurs côté
  serveur ». Écart à noter : `refundRate.ts` et `refundedRevenue.ts` comptent des commandes
  `refunded` en nombre et en TTC, contre D11.
- 2026-11-24 : écarts avec la démo relevés dans `docs/domain-model.md` (schémas, 53 fonctions de
  `lib/kpis`, composants clients, découpage des dates). Découverte : une commande `refunded`
  sort aujourd'hui entièrement du chiffre d'affaires, alors que le modèle la compte payée puis
  déduit ses remboursements à leur date. À la question de la lisibilité de `schemas.ts`, le
  découpage par contexte de D5 est maintenu après ce jalon ; sa répartition est précisée dans
  la case roadmap de la phase D. Phase B terminée.
- 2026-11-24 : phase C commencée. Squelette d'`apps/api` : `tsconfig.json` sans le DOM, qui
  inclut `vitest.config.mts` (sans quoi `tsc` échoue tant que `src/` est vide) ;
  `passWithNoTests` dans `vitest.config.mts`, à retirer avec le premier value object. Découverte :
  `npm run test:watch --workspaces` lance les paquets l'un après l'autre et le premier watch ne
  se termine jamais ; avec l'accord de l'utilisateur, `test:watch` quitte la racine, qui ne garde
  que des commandes non interactives couvrant tout le dépôt. Règle d'imports ajoutée à
  `eslint.config.mjs` : neuf imports interdits temporaires ont chacun fait échouer
  `npm run lint` (code 1), les imports autorisés passent, tests compris. Limite : ses
  expressions régulières supposent `domain/` à plat (D22), à revoir avec des sous-dossiers par
  aggregate.
- 2026-11-24 : `Money` en TDD, avec `DomainError` (D32) et `CurrencyCode` dans leur propre
  fichier (D22) ; 23 tests, rouge montré avant le code. Devises reconnues par
  `Intl.supportedValuesOf('currency')`, décimales par `Intl.NumberFormat` (EUR 2, JPY 0, KWD 3).
  Helper de test `errorCodeOf` dans `apps/api/src/testing/`, hors couverture ;
  `passWithNoTests` retiré.
- 2026-11-25 : revue de code de `Money` (`/code-review high`). Découverte : les décimales
  d'`Intl` diffèrent d'ISO 4217 pour une quinzaine de devises, vérifié sous Node 24.22.2 ;
  D47 tranchée, table de 165 codes comparée à la liste officielle du 2026-09-17. Aussi corrigés :
  `-0` ramené à `0` par `money()`, `errorCodeOf` qui refuse une action async (et ses propres
  tests), bornes négatives testées (caractérisation, prouvée par une mutation de
  `Number.isSafeInteger` en `isInteger` borné en haut seulement : 2 échecs, puis annulée).
  Écartés : revérification de la devise dans `addMoney` (coût négligeable) et règle d'imports
  pour `src/testing/` (helpers de test seulement).
- 2026-11-25 : `OrderStatus` en TDD, premier fichier du contexte `sales` (sans `index.ts`, aucun
  use case à exporter, D20) ; 16 tests, rouge montré avant le code (9 échecs d'assertion sur un
  squelette qui exportait les noms). D48 tranchée : union de littéraux sans marque. La
  déduction du statut depuis la date de paiement (D43) est laissée à l'entity `Order`, qui porte
  l'invariant « `paid` si et seulement si date de paiement », au jalon « Synchronisation ».
- 2026-11-25 : revue de code d'`OrderStatus`. Corrigés : `ORDER_STATUSES` figé par
  `Object.freeze` (test rouge montré), D48 requalifiée en « remplace D31 sur ce point ». Écarté
  ici : tronquer la valeur refusée recopiée dans le message d'une `DomainError` (`orderStatus`,
  `currencyCode`). Les journaux JSON (jalon 007, D24) échappent déjà les retours à la ligne ; la
  longueur se borne en un seul endroit, à l'écriture du journal de synchronisation, pour tous
  les messages : point du jalon « Synchronisation ».

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
