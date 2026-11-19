# Roadmap SalesPulse

Jalons des développements en cours et à venir, un fichier par jalon dans `docs/milestones/`.
Version actuelle : **0.3.3**.

Légende : ⬜ à faire · 🔄 en cours · ✅ terminé

## En cours

- 🔄 [007 — Vision du backend](milestones/007-backend-vision.md)

## Terminés

- ✅ [006 — Monorepo](milestones/006-monorepo.md) — v0.3.3
- ✅ [005 — Vision et stack](milestones/005-vision-and-stack.md) — v0.3.3
- ✅ [004 — Fichiers de jalons](milestones/004-milestone-files.md) — v0.3.3
- ✅ [003 — Conventions partagées](milestones/003-shared-conventions.md) — v0.3.3
- ✅ [002 — Correctifs de la revue de code](milestones/002-review-fixes.md) — v0.3.2
- ✅ [001 — Tests unitaires](milestones/001-unit-tests.md) — v0.3.2

## Jalons futurs

### Backend, dans l'ordre

Suite décidée au jalon 007 : les décisions citées (D1 à D25) et le détail des sujets ouverts y
sont écrits. Le MVP couvre les commandes et ce qui s'en déduit (clients, produits) :
l'analytics reste simulé tant qu'il n'a pas de vraie source (piste « Analytics réel »). Chaque
jalon laisse `main` déployable.

- ⬜ **Intégration continue** (D23) : prérequis aucun.
  - workflow GitHub Actions : `npm ci`, lint, typecheck et tests à chaque push et à chaque pull
    request ; auto-déploiement de Render passé sur *After CI Checks Pass* ;
  - sujet ouvert : pull requests et protection de branche (variante légère ou complète, cette
    dernière demandant d'adapter `docs/gitflow.md`) ; branche de base Neon par branche Git, en
    option.
- ⬜ **Socle API** : prérequis Intégration continue.
  - `apps/api` en Express, qui exporte son application ; serveur unique qui sert l'API et
    délègue le reste à Next.js (D22), avec l'emplacement du point d'entrée à trancher ;
  - PostgreSQL : Docker en local, Neon en région Frankfurt ; migrations versionnées, appliquées
    au démarrage ;
  - modèle commun : organisation, boutique, commande, produit, client pseudonymisé (D7, P15) ;
    montants en unités mineures avec leur devise, devise de référence fixée à l'euro (D17) ;
  - sujets ouverts : définitions métier (statuts canoniques, HT ou TTC, livraison, remises,
    remboursements) et fuseau horaire de l'organisation (découpage des jours, changements
    d'heure) ;
  - configuration validée au démarrage, clé de chiffrement des identifiants de boutique et sa
    rotation (P16) ; journaux JSON et `/health` (D24) ;
  - stratégie de tests du backend : base jetable, tests d'isolation (P11), conventions TDD et
    couverture étendues à `apps/api`, CI complété par une PostgreSQL de service ;
  - déploiement minimal pour garder `main` déployable : `render.yaml`, base Neon, migrations
    au démarrage.
- ⬜ **Authentification et organisations** : prérequis Socle API.
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
  - connecteur de démonstration : générateurs déplacés dans un paquet partagé, Faker en
    dépendance d'exécution ; organisation de démonstration créée au démarrage ;
  - sujet ouvert : démonstration qui vieillit (fenêtre glissante, réinitialisation) ;
  - suivi des synchronisations en base et fraîcheur affichée (P13, D24) ; quotas d'essai ;
    refus des boutiques hors euros (D11).
- ⬜ **Indicateurs côté serveur et gestion des boutiques** : prérequis Synchronisation, et de
  préférence l'Outillage de tests UI (les hooks sont réécrits).
  - routes d'agrégats (D8) : les fonctions de calcul des indicateurs passent côté serveur, en
    TDD ; hooks réécrits pour charger les agrégats ;
  - contrat d'API rétrocompatible (interface et API déployables séparément plus tard) ;
    performance : index, agrégats journaliers pré-calculés, réveil de la base ;
  - page de gestion des boutiques : connecter, tester la connexion, synchroniser, voir l'état ;
  - retrait des routes `/api` de démonstration des commandes ; sujet ouvert : devenir des
    routes de l'analytics simulé ;
  - intègre la piste « Produits en déclin réels ».
- ⬜ **Connecteur WooCommerce** : prérequis Indicateurs côté serveur.
  - clés REST en lecture seule, traduction des statuts vers le modèle commun, contrôle de la
    devise ; tests sur des réponses enregistrées.
- ⬜ **Ouverture aux testeurs** : prérequis Connecteur WooCommerce.
  - journal d'audit (P18) ; Sentry côté API et navigateur, région UE (D24) ;
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
  personnalisée boutique par boutique ; montant dans la devise de la boutique (`shop_money`).
- ⬜ **Connecteur PrestaShop** : clé de webservice en lecture seule.
- ⬜ **Multi-devises** (D17) : taux quotidiens de la BCE, conversion au taux du jour de la
  commande figée à la synchronisation, remboursements au taux de la commande d'origine, choix
  de la devise de référence, levée du refus des boutiques hors euros, comparaison à taux
  constant en option. Réécrit le principe P9 de `docs/vision.md`.

### Autres pistes

- ⬜ **Outillage de tests UI** (prérequis du TDD sur les composants et les hooks, à placer
  avant « Indicateurs côté serveur ») :
  - jsdom + `@testing-library/react`, avec un environnement jsdom limité aux `*.test.tsx` et
    `include` Vitest étendu aux `.tsx` ;
  - hooks testés via `renderHook` avec un `QueryClient` de test ;
  - couverture étendue à `apps/web/src/components` ;
  - points repris de la phase 3 du jalon 001 : `KpiDelta.tsx`, routes API
    (`GET(new NextRequest(url))` avec le store mocké via `vi.mock`), invariants du mock
    (`generateDataset` validé par `DatasetSchema.parse`).

Pistes relevées dans les commentaires du code, à valider et prioriser :

- ⬜ **Produits en déclin réels** : remplacer le placeholder aléatoire de
  `apps/web/src/lib/kpis/decliningProducts.ts` par une vraie comparaison entre la période
  courante et la période de comparaison. À faire dans « Indicateurs côté serveur ».
- ⬜ **Comparaison à la période précédente** : ajouter un mode à `ComparisonMode`
  (`apps/web/src/lib/filters/comparisonRange.ts`), en plus du N-1.
- ⬜ **Analytics réel** : contexte distinct des commandes et des clients, qui demande une autre
  source de données (par exemple un connecteur Google). Trafic, pages, recherches, Web Vitals,
  e-mails, erreurs et dépenses publicitaires restent mockés tant que cette source n'existe pas,
  de même que les KPIs qui croisent analytics et commandes.

Pistes issues de `docs/vision.md` et `docs/stack.md`, à valider et prioriser :

- ⬜ **Alertes et notifications** : prévenir l'utilisateur quand un indicateur sort de sa plage
  habituelle.
- ⬜ **Exports** : exporter les données ou les indicateurs affichés ; servirait aussi la
  réversibilité des données d'un commerçant (jalon 007, D9).
- ⬜ **Prévisions** : projeter les indicateurs sur la période à venir.
- ⬜ **Server Components à la place de TanStack Query** : à réévaluer après le MVP, une fois
  les indicateurs calculés par le serveur (voir l'entrée TanStack Query de `docs/stack.md`).
