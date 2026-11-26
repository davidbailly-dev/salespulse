# Roadmap SalesPulse

Jalons des développements en cours et à venir, un fichier par jalon dans `docs/milestones/`.
Version actuelle : **0.3.3**.

Légende : ⬜ à faire · 🔄 en cours · ✅ terminé

## En cours

- 🔄 [011 — Serveur API](milestones/011-api-server.md)

## Terminés

- ✅ [010 — Modèle de données](milestones/010-data-model.md) — non publié
- ✅ [009 — Outillage de tests UI](milestones/009-ui-test-tooling.md) — non publié
- ✅ [008 — Intégration continue](milestones/008-continuous-integration.md) — non publié
- ✅ [007 — Vision du backend](milestones/007-backend-vision.md) — non publié
- ✅ [006 — Monorepo](milestones/006-monorepo.md) — v0.3.3
- ✅ [005 — Vision et stack](milestones/005-vision-and-stack.md) — v0.3.3
- ✅ [004 — Fichiers de jalons](milestones/004-milestone-files.md) — v0.3.3
- ✅ [003 — Conventions partagées](milestones/003-shared-conventions.md) — v0.3.3
- ✅ [002 — Correctifs de la revue de code](milestones/002-review-fixes.md) — v0.3.2
- ✅ [001 — Tests unitaires](milestones/001-unit-tests.md) — v0.3.2

## Jalons futurs

### Backend, dans l'ordre

Suite décidée au jalon 007 : les décisions citées (D1 à D25) et le détail des sujets ouverts y
sont écrits. Les décisions du jalon 010 sont citées avec leur jalon (« jalon 010, D43 »), et le
modèle commun du backend est décrit dans `docs/domain-model.md`. Le MVP couvre les commandes et
ce qui s'en déduit (clients, produits) : l'analytics reste simulé tant qu'il n'a pas de vraie
source (piste « Analytics réel »). Chaque jalon laisse `main` déployable.

Le socle du backend se découpe en quatre jalons courts, pour que chaque pull request reste
relisible (seuils dans `CLAUDE.md`) : le premier, Modèle de données (jalon 010), est terminé, le
deuxième, Serveur API (jalon 011), est en cours. Jusqu'au jalon « Déploiement du socle », Render
continue de lancer Next.js seul : `apps/api` est testé par le CI sans être déployé.

- ⬜ **Base de données** : prérequis Serveur API (jalon 011).
  - PostgreSQL sous Docker en local ; migrations versionnées des tables du modèle de données
    (`docs/domain-model.md`) ; version des UUID à trancher, v7 pressentie (jalon 010, D23) ;
    index sur (organisation, jour local) (jalon 010, D42) ; sécurité au niveau des lignes en
    option (jalon 010, D28) ;
  - migrations rétrocompatibles (*expand / contract*) : l'ancienne version tourne sur le
    nouveau schéma, pour garder le rollback de Render possible ; convention à reporter dans
    `CLAUDE.md` ;
  - stratégie de tests : base jetable, tests d'isolation (P11), adapters de lecture testés contre
    une vraie PostgreSQL (jalon 010, D42), CI complété par une PostgreSQL de service et, en
    option, par une branche de base Neon par branche Git.
- ⬜ **Déploiement du socle** : prérequis Base de données.
  - `render.yaml`, serveur unique lancé par Render, base Neon en région Frankfurt, migrations
    appliquées au démarrage.
- ⬜ **Authentification et organisations** : prérequis Déploiement du socle.
  - connexion par e-mail et mot de passe (D4) : argon2id, cookie de session `HttpOnly` /
    `Secure` / `SameSite`, protection CSRF, CORS limité, en-têtes de sécurité ;
  - organisations, membres et rôles propriétaire / administrateur / lecteur (D1, D3) ;
    isolation entre organisations testée (P11) ;
  - inscription sur invitation (D18), sans e-mail (D21) : back-office minimal pour les codes
    d'invitation et les liens de réinitialisation ;
  - rate limit et anti-spam de la phase de test (D19) ;
  - bouton « Voir la démo » qui ouvre une session lecteur (D5) ;
  - sujet ouvert : cycle de vie des comptes (changement d'e-mail, suppression, transfert de
    propriété, départ du dernier propriétaire).
- ⬜ **Synchronisation et plateforme de démonstration** : prérequis Authentification.
  - tâches de synchronisation reprenables en base, avec curseur ; déclencheurs à la demande, au
    branchement et à la visite quand les données sont trop anciennes (D6, D16) ;
  - import de l'historique au branchement (P14), synchronisation incrémentale sur la date de
    modification, détection des suppressions, rattrapage périodique ; ralentissement et
    nouvelles tentatives face aux quotas des plateformes ;
  - clé de chiffrement des identifiants de boutique et sa rotation (P16), utile dès le premier
    connecteur ; de la même clé maîtresse, secret par organisation de l'empreinte client,
    calculée par l'adapter (jalon 010, D14 et D18) ;
  - aggregates de Ventes (commande, remboursement, produit, client) et leurs use cases
    d'écriture : statut déduit de la date de paiement dans l'entity commande (jalon 010, D43),
    champs dérivés calculés à l'écriture et use case de recalcul (jalon 010, D38 et D39) ;
    sous-dossiers par aggregate dans `domain/` à trancher, avec la règle d'imports d'ESLint à
    revoir (jalon 010, D22) ;
  - connecteur de démonstration : générateurs déplacés dans un paquet partagé, Faker en
    dépendance d'exécution ; il produit le modèle canonique, ce qui comble les écarts **S** de
    `docs/domain-model.md` ; `Dataset` et `AnalyticsDataset` quittent le contrat avec les
    générateurs (jalon 010, D5) ; organisation de démonstration créée au démarrage ;
  - sujet ouvert : démonstration qui vieillit (fenêtre glissante, réinitialisation) ;
  - suivi des synchronisations en base et fraîcheur affichée (P13, D24) : une `DomainError` y
    est inscrite sans arrêter la synchronisation (jalon 010, D32), avec des messages de longueur
    bornée ; quotas d'essai ; refus des boutiques hors euros (D11).
- ⬜ **Indicateurs côté serveur et gestion des boutiques** : prérequis Synchronisation ; les
  hooks réécrits le sont sous le filet de l'Outillage de tests UI (jalon 009, terminé).
  - routes d'agrégats (D8) : les fonctions de calcul des indicateurs passent côté serveur, en
    TDD ; hooks réécrits pour charger les agrégats ; les listes brutes du contrat sont remplacées
    par des agrégats nommés par usage (jalon 010, D5) ; la période devient une plage de jours
    locaux (jalon 010, D40) ; comble les écarts **I** de `docs/domain-model.md` ;
  - à trancher : le panier moyen et le chiffre d'affaires par client, avant ou après
    remboursements (jalon 010, D10 et D11 ne le disent pas) ; le format du paramètre `?shop=`,
    UUID ou slug, avec la page de gestion des boutiques ;
  - nouvel indicateur : commandes annulées après paiement sans remboursement enregistré, en
    nombre et en montant, que le commerçant doit régulariser (jalon 010, D43) ;
  - contrat d'API rétrocompatible (interface et API déployables séparément plus tard) ;
    performance : index, agrégats journaliers pré-calculés si les temps mesurés le demandent
    (jalon 010, D42), recalculés au changement de fuseau de l'organisation (jalon 010, D12),
    réveil de la base ;
  - page de gestion des boutiques : connecter, tester la connexion, synchroniser, voir l'état ;
  - retrait des routes `/api` de démonstration des commandes ; sujet ouvert : devenir des
    routes de l'analytics simulé ;
  - intègre la piste « Produits en déclin réels ».
- ⬜ **Connecteur WooCommerce** : prérequis Indicateurs côté serveur.
  - clés REST en lecture seule, traduction des statuts selon la correspondance de
    `docs/domain-model.md` (jalon 010, D44), contrôle de la devise ; tests sur des réponses
    enregistrées ;
  - à vérifier (`docs/domain-model.md`, « Points à vérifier aux jalons des connecteurs ») :
    statut brouillon et corbeille, effacement de `date_paid` à l'annulation (jalon 010, D43),
    statuts personnalisés exposés par l'API REST ; à trancher : catégorie principale d'un
    produit, que WooCommerce ne désigne pas (jalon 010, D13).
- ⬜ **Ouverture aux testeurs** : prérequis Connecteur WooCommerce.
  - journal d'audit (P18) ; Sentry côté API et navigateur, région UE (D24) ;
  - erreurs Sentry rattachées à leur release (version et source maps), vérifiées dans la
    procédure de release ;
  - sauvegardes : rétention de l'offre gratuite de Neon à vérifier, test de restauration ;
  - planificateur externe gratuit en option (D16) ;
  - juridique minimal, puisque les testeurs apportent de vraies données : mentions légales,
    politique de confidentialité, sous-traitants ultérieurs, procédure en cas de fuite.
- ⬜ **Facturation** : prérequis Ouverture aux testeurs.
  - modèle tarifaire à trancher (D2), essai gratuit, abonnement ;
  - fin d'essai et impayé : lecture gardée, synchronisation suspendue (D10, P19) ; délai de
    suppression à fixer, effacement à la résiliation (D9) ;
  - back-office : abonnements, organisations, quotas.
- ⬜ **Ouverture commerciale** : prérequis Facturation.
  - inscription libre (D2) avec l'anti-spam complet : e-mail vérifié, preuve de travail
    auto-hébergée, domaines jetables (D19) ;
  - e-mails transactionnels (D21) et nom de domaine ;
  - passage en plan payant : worker et tâche planifiée, API éventuellement séparée en service
    propre (D16, D22) ;
  - juridique complet : conditions d'utilisation et de vente, accord de sous-traitance ;
  - retrait de la note de transition de `docs/vision.md` (D15).
- ⬜ **Connecteur Shopify** : compte partenaire et revue de l'application, ou distribution
  personnalisée boutique par boutique ; montant dans la devise de la boutique (`shop_money`) ;
  statuts et date de paiement selon `docs/domain-model.md` (jalon 010, D45) ; commandes de test
  non synchronisées (jalon 010, D8).
  - À vérifier (`docs/domain-model.md`) : `processedAt` des transactions, « marquer comme
    payée », annulation par l'API, statut des transactions d'un remboursement, capture partielle
    définitive (`PARTIALLY_PAID`) ; décalage lu sur chaque date (jalon 010, D12). À trancher :
    référence externe des `productType`, qui ne sont pas des entities (jalon 010, D29).
- ⬜ **Connecteur PrestaShop** : clé de webservice en lecture seule ; statuts selon l'indicateur
  `paid` des états (jalon 010, D46).
  - À vérifier (`docs/domain-model.md`) : état « Refunded » sans avoir, montants HT des avoirs,
    fuseau des dates et lecture du fuseau de la boutique (jalon 010, D12).
- ⬜ **Multi-devises** (D17) : taux quotidiens de la BCE, conversion au taux du jour de la
  commande figée à la synchronisation, remboursements au taux de la commande d'origine, choix
  de la devise de référence, levée du refus des boutiques hors euros, comparaison à taux
  constant en option. Réécrit le principe P9 de `docs/vision.md`.

### Autres pistes

Pistes relevées dans le code et les jalons, à valider et prioriser :

- ⬜ **Paniers abandonnés réels** (jalon 010, D8) : entity distincte des commandes, fournie par
  les seuls connecteurs qui en disposent (`AbandonedCheckout` chez Shopify, paniers sans
  commande chez PrestaShop, rien dans le cœur de WooCommerce). D'ici là, l'indicateur « Paniers
  abandonnés » et le statut `abandoned` restent propres à la démonstration.
- ⬜ **Produits en déclin réels** : remplacer le placeholder aléatoire de
  `apps/web/src/lib/kpis/decliningProducts.ts` par une vraie comparaison entre la période
  courante et la période de comparaison. À faire dans « Indicateurs côté serveur ».
- ⬜ **Comparaison à la période précédente** : ajouter un mode à `ComparisonMode`
  (`apps/web/src/lib/filters/comparisonRange.ts`), en plus du N-1.
- ⬜ **Analytics réel** : contexte distinct des commandes et des clients, qui demande une autre
  source de données (par exemple un connecteur Google). Trafic, pages, recherches, Web Vitals,
  e-mails, erreurs et dépenses publicitaires restent mockés tant que cette source n'existe pas,
  de même que les KPIs qui croisent analytics et commandes (taux de conversion, CAC, ROAS,
  taux d'échec de paiement), composés dans le contexte Analytics (jalon 010, D17). Reprend le
  canal d'acquisition et l'appareil des commandes, sortis du modèle de commande du MVP : la
  piste choisit leur source, un connecteur analytics relié aux commandes par leur identifiant,
  avec en complément éventuel l'attribution des plateformes (jalon 010, D15).

Pistes issues de `docs/vision.md` et `docs/stack.md`, à valider et prioriser :

- ⬜ **Tests de bout en bout et vérification après déploiement** (P21) : indépendant du
  backend, peut passer avant le Serveur API.
  - Playwright, entrée à ajouter dans `docs/stack.md` : quelques parcours critiques
    (affichage du dashboard, changement de boutique et de période, données d'une route API),
    lancés dans le CI sur le build de production ;
  - smoke test après chaque release : les mêmes parcours sur l'URL Render, lancés depuis
    GitHub Actions (rien ne tourne chez Render) ; d'abord une étape de réveil, l'instance
    gratuite mettant environ une minute à sortir de veille, puis l'attente de la nouvelle
    version, publiée par une balise `<meta>` du layout puis par `/health` (Serveur API) ;
  - procédure de release dans `CLAUDE.md` : CI au vert, tag, smoke test au vert, rollback de
    Render en cas d'échec.
- ⬜ **Alertes et notifications** : prévenir l'utilisateur quand un indicateur sort de sa plage
  habituelle.
- ⬜ **Exports** : exporter les données ou les indicateurs affichés ; servirait aussi la
  réversibilité des données d'un commerçant (jalon 007, D9).
- ⬜ **Prévisions** : projeter les indicateurs sur la période à venir.
- ⬜ **Server Components à la place de TanStack Query** : à réévaluer après le MVP, une fois
  les indicateurs calculés par le serveur (voir l'entrée TanStack Query de `docs/stack.md`).
